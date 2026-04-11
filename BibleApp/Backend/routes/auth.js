import express from 'express';
import supabase from '../supabase/supabase.js';
import { requireAuth, requireSameUser } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * DELETE /api/auth/account/:userId
 * Elimina la cuenta del usuario y todos sus datos asociados.
 * - Email/Password: requiere verificación de contraseña.
 * - Google OAuth: ya autenticado por token, no requiere contraseña.
 */
router.delete('/account/:userId', requireAuth, requireSameUser, async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        console.log(`🗑️ Iniciando eliminación de cuenta para usuario: ${userId}`);

        // 1. Obtener el usuario del middleware (ya autenticado por JWT)
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'unauthorized',
                message: 'User not authenticated'
            });
        }

        // 2. Detectar el proveedor de autenticación
        const provider = user.app_metadata?.provider || 'email';
        const isOAuthUser = provider !== 'email';

        console.log(`🔍 Proveedor de autenticación: ${provider}`);

        // 3. Si es email/password, verificar la contraseña
        if (!isOAuthUser) {
            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'password_required',
                    message: 'Password is required to delete account'
                });
            }

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
        } else {
            // Para OAuth, el token JWT ya valida la identidad — no se necesita contraseña
            console.log('✅ Usuario OAuth autenticado por token, omitiendo verificación de contraseña');
        }

        // 4. Eliminar datos de tablas custom con la función RPC
        console.log('🗃️ Eliminando datos del usuario en tablas custom...');
        const { error: deleteDataError } = await supabase.rpc('delete_user', {
            user_id: userId
        });

        if (deleteDataError) {
            console.error('❌ Error eliminando datos con RPC:', deleteDataError);
            return res.status(500).json({
                success: false,
                error: 'delete_failed',
                message: 'Failed to delete user data.',
                details: deleteDataError.message,
                code: deleteDataError.code
            });
        }

        console.log('✅ Datos del usuario eliminados de tablas custom');

        // 5. Eliminar el usuario de auth.users usando la Admin API.
        // La función RPC ya intenta hacer DELETE FROM auth.users, pero puede fallar
        // silenciosamente si el rol no tiene permisos suficientes sobre el schema auth.
        // La Admin API garantiza la eliminación usando el service role key.
        // Si el RPC ya lo eliminó, simplemente ignoramos el error "not found".
        console.log('🔐 Eliminando usuario de auth.users (Admin API)...');
        const { error: adminDeleteError } = await supabase.auth.admin.deleteUser(userId);

        if (adminDeleteError) {
            // Si el error es "not found", el RPC ya eliminó al usuario → éxito
            const alreadyDeleted = adminDeleteError.message?.toLowerCase().includes('not found') ||
                                   adminDeleteError.message?.toLowerCase().includes('no rows') ||
                                   adminDeleteError.status === 404;

            if (!alreadyDeleted) {
                console.error('❌ Error eliminando usuario de auth:', adminDeleteError);
                return res.status(500).json({
                    success: false,
                    error: 'auth_delete_failed',
                    message: 'User data was deleted but failed to remove auth account. Please contact support.',
                    details: adminDeleteError.message
                });
            }
            console.log('ℹ️ Usuario ya eliminado de auth.users por el RPC — OK');
        } else {
            console.log('✅ Usuario eliminado de auth.users via Admin API');
        }

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
