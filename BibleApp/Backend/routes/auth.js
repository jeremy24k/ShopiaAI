import express from 'express';
import supabase from '../supabase/supabase.js';
import { requireAuth, requireSameUser } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * DELETE /api/auth/account/:userId
 * Elimina la cuenta del usuario y todos sus datos asociados
 * Requiere autenticación y que el usuario sea el mismo que intenta eliminar
 */
router.delete('/account/:userId', requireAuth, requireSameUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'password_required',
                message: 'Password is required to delete account'
            });
        }

        console.log(`🗑️ Iniciando eliminación de cuenta para usuario: ${userId}`);

        // 1. Obtener el usuario del middleware (ya autenticado)
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'unauthorized',
                message: 'User not authenticated'
            });
        }

        // Verificar la contraseña intentando hacer login
        const { error: passwordError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: password
        });

        if (passwordError) {
            return res.status(401).json({
                success: false,
                error: 'invalid_password',
                message: 'Invalid password'
            });
        }

        console.log('✅ Contraseña verificada');

        // 2. Llamar a la función SQL que elimina todo
        console.log('�️ Eliminando usuario y todos sus datos...');
        
        const { error: deleteUserError } = await supabase.rpc('delete_user', {
            user_id: userId
        });

        if (deleteUserError) {
            console.error('❌ Error eliminando usuario con RPC:', deleteUserError);
            console.error('Código de error:', deleteUserError.code);
            console.error('Detalles:', deleteUserError.details);
            
            return res.status(500).json({
                success: false,
                error: 'delete_failed',
                message: 'Failed to delete user account.',
                details: deleteUserError.message,
                code: deleteUserError.code
            });
        }

        console.log('✅ Usuario eliminado de Auth');
        console.log(`🎉 Cuenta eliminada exitosamente: ${userId}`);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('❌ Error eliminando cuenta:', error);
        res.status(500).json({
            success: false,
            error: 'server_error',
            message: 'An error occurred while deleting the account'
        });
    }
});

export default router;
