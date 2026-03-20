import supabase from "../supabase/supabase";
import Logger from "../utils/logger";

const logger = Logger.create('FeedbackService');

class FeedbackService {
    async saveFeedback({ userId, messageContent, messageIndex, feedbackType, verseContext, modeId, doctrineId }) {
        try {
            const { data: existingFeedback, error: checkError } = await supabase
                .from('ai_feedback')
                .select('id, feedback_type')
                .eq('user_id', userId)
                .eq('message_index', messageIndex)
                .gte('created_at', new Date().toISOString().split('T')[0])
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                throw checkError;
            }

            if (existingFeedback) {
                if (existingFeedback.feedback_type === feedbackType) {
                    const { error: deleteError } = await supabase
                        .from('ai_feedback')
                        .delete()
                        .eq('id', existingFeedback.id);

                    if (deleteError) throw deleteError;
                    return { action: 'removed', feedbackType };
                } else {
                    const { error: updateError } = await supabase
                        .from('ai_feedback')
                        .update({ feedback_type: feedbackType })
                        .eq('id', existingFeedback.id);

                    if (updateError) throw updateError;
                    return { action: 'updated', feedbackType };
                }
            }

            const { data, error } = await supabase
                .from('ai_feedback')
                .insert({
                    user_id: userId,
                    message_content: messageContent,
                    message_index: messageIndex,
                    feedback_type: feedbackType,
                    verse_context: verseContext,
                    mode_id: modeId,
                    doctrine_id: doctrineId
                })
                .select()
                .single();

            if (error) throw error;
            return { action: 'created', feedbackType, data };

        } catch (error) {
            logger.error('Error saving feedback:', error);
            throw error;
        }
    }

    async getUserFeedback(userId) {
        try {
            const { data, error } = await supabase
                .from('ai_feedback')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;

        } catch (error) {
            logger.error('Error fetching user feedback:', error);
            throw error;
        }
    }

    async getFeedbackStats() {
        try {
            const { data, error } = await supabase
                .from('ai_feedback')
                .select('feedback_type, mode_id, doctrine_id');

            if (error) throw error;

            const stats = {
                total: data.length,
                likes: data.filter(f => f.feedback_type === 'like').length,
                dislikes: data.filter(f => f.feedback_type === 'dislike').length,
                byMode: {},
                byDoctrine: {}
            };

            data.forEach(feedback => {
                if (feedback.mode_id) {
                    stats.byMode[feedback.mode_id] = (stats.byMode[feedback.mode_id] || 0) + 1;
                }
                if (feedback.doctrine_id) {
                    stats.byDoctrine[feedback.doctrine_id] = (stats.byDoctrine[feedback.doctrine_id] || 0) + 1;
                }
            });

            return stats;

        } catch (error) {
            logger.error('Error fetching feedback stats:', error);
            throw error;
        }
    }

    async getAllFeedbackWithUsers() {
        try {
            const { data: feedbackData, error: feedbackError } = await supabase
                .from('ai_feedback')
                .select('*')
                .order('created_at', { ascending: false });

            if (feedbackError) throw feedbackError;

            const userIds = [...new Set(feedbackData.map(f => f.user_id))];
            
            if (userIds.length === 0) return feedbackData;

            const { data: usersData, error: usersError } = await supabase
                .rpc('get_users_info', { user_ids: userIds });

            if (usersError) {
                logger.error('Error fetching users:', usersError);
                return feedbackData.map(feedback => ({
                    ...feedback,
                    user_email: 'Usuario desconocido',
                    user_name: null
                }));
            }

            const usersMap = new Map();
            if (usersData) {
                usersData.forEach(user => {
                    usersMap.set(user.id, {
                        email: user.email,
                        username: user.username
                    });
                });
            }

            const feedbackWithUsers = feedbackData.map(feedback => ({
                ...feedback,
                user_email: usersMap.get(feedback.user_id)?.email || 'Usuario desconocido',
                user_name: usersMap.get(feedback.user_id)?.username || 'Sin nombre'
            }));

            return feedbackWithUsers;

        } catch (error) {
            logger.error('Error fetching feedback with users:', error);
            throw error;
        }
    }

    async getGeneralFeedback() {
        try {
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Get user info for those who are logged in
            const userIds = [...new Set(data.filter(f => f.user_id).map(f => f.user_id))];
            
            let usersMap = new Map();
            if (userIds.length > 0) {
                try {
                    const { data: usersData, error: usersError } = await supabase
                        .rpc('get_users_info', { user_ids: userIds });

                    if (!usersError && usersData) {
                        usersData.forEach(user => {
                            usersMap.set(user.id, {
                                email: user.email,
                                username: user.username
                            });
                        });
                    } else if (usersError) {
                        logger.warn('RPC users info error:', usersError);
                    }
                } catch (rpcError) {
                    logger.warn('Could not fetch user info for dashboard:', rpcError);
                }
            }

            return data.map(feedback => ({
                ...feedback,
                display_email: feedback.email || usersMap.get(feedback.user_id)?.email || 'Anónimo',
                display_name: usersMap.get(feedback.user_id)?.username || 'Invitado'
            }));

        } catch (error) {
            logger.error('Error fetching general feedback:', error);
            throw error;
        }
    }
}

export default new FeedbackService();
