import express from 'express'
import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk'; // 👈 Importación actualizada
import { client } from '../config/paypal.js'; // 👈 Solo importamos el client, no paypal
import supabase from '../supabase/supabase.js';
import { CREDIT_PACKAGES, getPackageById } from '../config/creditPackages.js';

const router = express.Router();

// Crear instancia del controlador de órdenes
const ordersController = new OrdersController(client); // 👈 Nuevo

// ============================================
// POST /create-order - Crear orden de PayPal
// ============================================
router.post("/create-order", async (req, res) => {
    try {
        const { packageId, userId } = req.body; // 👈 CORREGIDO: req.body, no res.body

        if (!packageId || !userId) {
            return res.status(400).json({ error: "Missing packageId or userId" });
        }

        const pkg = getPackageById(packageId)

        if (!pkg) {
            return res.status(400).json({ error: 'Invalid package' })
        }

        // 👇 NUEVA FORMA de crear la orden
        const request = {
            prefer: 'return=representation',
            body: {
                intent: 'CAPTURE',
                purchaseUnits: [{
                    referenceId: userId,
                    description: pkg.description,
                    customId: `${userId}-${packageId}`,
                    amount: {
                        currencyCode: pkg.currency,
                        value: pkg.price.toFixed(2)
                    }
                }],
                paymentSource: {
                    paypal: {
                        experienceContext: {
                            brandName: 'ShopiaAI',
                            landingPage: 'NO_PREFERENCE',
                            userAction: 'PAY_NOW',
                            returnUrl: `${process.env.FRONTEND_URL}/api/payments/success`,
                            cancelUrl: `${process.env.FRONTEND_URL}/api/payments/cancel`
                        }
                    }
                }
            }
        };

        // Ejecutar la creación de la orden
        const { result } = await ordersController.createOrder(request); // 👈 NUEVA FORMA

        console.log('✅ Orden de PayPal creada:', result.id);

        res.json({
            orderID: result.id
        });

    } catch (error) {
        console.error('❌ Error creando orden de PayPal:', error);
        res.status(500).json({ error: 'Error creating PayPal order' });
    }
});

// ============================================
// POST /capture-order - Capturar pago de PayPal
// ============================================
router.post('/capture-order', async (req, res) => {
    try {
        const { orderID } = req.body

        if (!orderID) {
            return res.status(400).json({ error: 'Missing orderID' });
        }

        // 👇 NUEVA FORMA de capturar la orden
        const request = {
            id: orderID,
            prefer: 'return=representation'
        };

        const { result: captureData } = await ordersController.captureOrder(request); // 👈 NUEVA FORMA

        if (captureData.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Payment not completed' });
        }

        const customId = captureData.purchaseUnits[0].customId;
        const [userId, packageId] = customId.split('-');
        const pkg = getPackageById(packageId)

        if (!pkg) {
            return res.status(400).json({ error: 'Invalid package' })
        }

        // Verificar transacción duplicada
        const { data: existingTransaction } = await supabase
            .from('credit_transactions')
            .select('id')
            .eq('payment_reference', orderID)
            .single();

        if (existingTransaction) {
            return res.status(400).json({
                success: true,
                error: 'Transaction already exists',
                credits: pkg.credits
            });
        }

        // Obtener créditos actuales del usuario
        const { data: userCredits } = await supabase
            .from('user_credits')
            .select('credits, tier, total_paid_credits_purchased')
            .eq('user_id', userId)
            .single();

        const newCredits = (userCredits?.credits || 0) + pkg.credits;
        const totalPaid = (userCredits?.total_paid_credits_purchased || 0) + pkg.credits;

        // Actualizar créditos del usuario
        await supabase
            .from('user_credits')
            .upsert({
                user_id: userId,
                credits: newCredits,
                tier: 'PAID',
                updated_at: new Date(),
                total_paid_credits_purchased: totalPaid
            });

        // Registrar transacción
        await supabase
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount: pkg.credits,
                type: 'purchase',
                description: `Buy ${pkg.credits} credits for ${pkg.name}`,
                payment_method: 'paypal',
                payment_reference: orderID,
                status: 'completed'
            });

        console.log(`✅ ${pkg.credits} créditos acreditados a usuario ${userId}`);

        res.json({
            success: true,
            credits: pkg.credits,
            newBalance: newCredits
        });

    } catch (error) {
        console.error('❌ Error processing payment:', error);
        res.status(500).json({ error: 'Error capturing PayPal order' });
    }
});

// ============================================
// GET /packages - Listar paquetes disponibles
// ============================================
router.get("/packages", (req, res) => {
    res.json({
        packages: Object.values(CREDIT_PACKAGES)
    });
});

// ============================================
// GET /credits/:userId - Obtener créditos del usuario
// ============================================
router.get('/credits/:userId', async (req, res) => {
    try {
        const { userId } = req.params

        const { data, error } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        res.json({
            data: data,
            credits: data?.credits || 0,
            tier: data?.tier || 'FREE'
        });

    } catch (error) {
        console.error('❌ Error fetching credits:', error);
        res.status(500).json({ error: 'Error fetching credits' });
    }
});

// ============================================
// POST /daily-credits - Otorgar créditos diarios
// ============================================
router.post('/daily-credits', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing userId' });
        }

        const { data, error } = await supabase.rpc('grant_daily_credits', {
            p_user_id: userId
        });

        if (error) {
            console.error('❌ Error otorgando créditos diarios:', error);
            return res.status(500).json({ error: 'Error granting daily credits' });
        }

        res.json(data);

    } catch (error) {
        console.error('❌ Error en daily-credits:', error);
        res.status(500).json({ error: 'Error processing daily credits' });
    }
});

export default router;