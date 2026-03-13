import express from 'express';
import supabase from '../supabase/supabase.js';

const router = express.Router();

// POST /api/feedback - Enviar feedback
router.post('/', async (req, res) => {
    try {
        const { userId, email, type, message, userAgent } = req.body;

        if (!message || !type) {
            return res.status(400).json({ error: 'Message and type are required' });
        }

        const { data, error } = await supabase
            .from('feedback')
            .insert([
                { 
                    user_id: userId || null, 
                    email: email || null, 
                    type, 
                    message, 
                    user_agent: userAgent || null 
                }
            ]);

        if (error) throw error;

        res.status(201).json({ success: true, message: 'Feedback sent successfully' });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

export default router;
