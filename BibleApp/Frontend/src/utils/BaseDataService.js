import supabase from '../supabase/supabase';
import Logger from './logger';

const logger = Logger.create('BaseDataService');

class BaseDataService {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async load({ userId, select = '*', orderBy = null, filters = {} }) {
    if (!userId) {
      return { success: false, error: 'No user authenticated', data: [] };
    }

    try {
      let query = supabase
        .from(this.tableName)
        .select(select)
        .eq('user_id', userId);

      if (orderBy) {
        query = query.order(orderBy.column || 'created_at', { ascending: orderBy.ascending ?? false });
      }

      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error loading from ${this.tableName}:`, error);
        return { success: false, error: error.message, data: [] };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error(`Error loading from ${this.tableName}:`, error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async save({ data, userId, uniqueCheck = null, existsMessage = 'Item already exists' }) {
    if (!userId) {
      return { success: false, error: 'No user authenticated' };
    }

    try {
      if (uniqueCheck) {
        const { data: existing, error: checkError } = await supabase
          .from(this.tableName)
          .select('id')
          .eq('user_id', userId);

        if (checkError) throw checkError;

        const matchesExisting = existing?.some(item => 
          Object.entries(uniqueCheck).every(([key, value]) => item[key] === value)
        );

        if (matchesExisting && existing?.length > 0) {
          return { success: true, exists: true, message: existsMessage, data: existing[0] };
        }
      }

      const insertData = { ...data, user_id: userId };
      
      const { data: newItem, error: insertError } = await supabase
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        logger.error(`Error saving to ${this.tableName}:`, insertError);
        return { success: false, error: insertError.message };
      }

      return { success: true, data: newItem, exists: false };
    } catch (error) {
      logger.error(`Error saving to ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async update(id, updates, userId) {
    if (!userId) {
      return { success: false, error: 'No user authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error(`Error updating ${this.tableName}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error(`Error updating ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async delete(id, userId) {
    if (!userId) {
      return { success: false, error: 'No user authenticated' };
    }

    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        logger.error(`Error deleting from ${this.tableName}:`, error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      logger.error(`Error deleting from ${this.tableName}:`, error);
      return { success: false, error: error.message };
    }
  }

  async exists(uniqueCheck, userId) {
    if (!userId) return false;

    try {
      let query = supabase
        .from(this.tableName)
        .select('id')
        .eq('user_id', userId);

      for (const [key, value] of Object.entries(uniqueCheck)) {
        query = query.eq(key, value);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  }
}

export default BaseDataService;
