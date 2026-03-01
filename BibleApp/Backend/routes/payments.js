import express from 'express'
import { Client, Environment, OrdersController } from '@paypal/paypal-server-sdk';
import { client } from '../config/paypal.js';
import supabase from '../supabase/supabase.js';
import { CREDIT_PACKAGES, getPackageById } from '../config/creditPackages.js';

const router = express.Router();
const ordersController = new OrdersController(client);

// POST /create-order - Create PayPal order
router.post("/create-order", async (req, res) => {
    try {
        const { packageId, userId } = req.body;

        if (!packageId || !userId) {
            return res.status(400).json({ error: "Missing packageId or userId" });
        }

        const pkg = getPackageById(packageId)

        if (!pkg) {
            return res.status(400).json({ error: 'Invalid package' })
        }

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

        const { result } = await ordersController.createOrder(request);

        res.json({
            orderID: result.id
        });

    } catch (error) {
        console.error('Error creating PayPal order:', error);
        res.status(500).json({ error: 'Error creating PayPal order' });
    }
});

// POST /capture-order - Capture PayPal payment
router.post('/capture-order', async (req, res) => {
    try {
        const { orderID } = req.body

        if (!orderID) {
            return res.status(400).json({ error: 'Missing orderID' });
        }

        const request = {
            id: orderID,
            prefer: 'return=representation'
        };

        const { result: captureData } = await ordersController.captureOrder(request);

        if (captureData.status !== 'COMPLETED') {
            return res.status(400).json({ 
                error: 'Payment not completed',
                status: captureData.status 
            });
        }

        const customId = captureData.purchaseUnits[0].customId;
        
        // Split by last dash to handle UUIDs with dashes
        const lastDashIndex = customId.lastIndexOf('-');
        const userId = customId.substring(0, lastDashIndex);
        const packageId = customId.substring(lastDashIndex + 1);
        
        const pkg = getPackageById(packageId)

        if (!pkg) {
            return res.status(400).json({ error: 'Invalid package' })
        }

        // Check for duplicate transaction
        const { data: existingTransaction } = await supabase
            .from('credit_transactions')
            .select('id')
            .eq('payment_reference', orderID)
            .maybeSingle();

        if (existingTransaction) {
            return res.status(400).json({
                success: true,
                error: 'Transaction already exists',
                credits: pkg.credits
            });
        }

        // Get current user credits
        const { data: userCredits } = await supabase
            .from('user_credits')
            .select('credits, tier, total_paid_credits_purchased')
            .eq('user_id', userId)
            .single();

        const newCredits = (userCredits?.credits || 0) + pkg.credits;
        const totalPaid = (userCredits?.total_paid_credits_purchased || 0) + pkg.credits;

        // Update user credits
        const { error: updateError } = await supabase
            .from('user_credits')
            .upsert({
                user_id: userId,
                credits: newCredits,
                tier: pkg.name,
                updated_at: new Date(),
                total_paid_credits_purchased: totalPaid
            }, {
                onConflict: 'user_id'
            });

        if (updateError) {
            console.error('Error updating credits:', updateError);
            throw new Error('Failed to update credits');
        }

        // Record transaction
        const { error: insertError } = await supabase
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

        if (insertError) {
            console.error('Error recording transaction:', insertError);
            throw new Error('Failed to record transaction');
        }

        console.log(`✅ ${pkg.credits} credits added to user ${userId} package: ${pkg.name}`);

        res.json({
            success: true,
            credits: pkg.credits,
            newBalance: newCredits
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Error capturing PayPal order' });
    }
});

// GET /packages - List available credit packages
router.get("/packages", (req, res) => {
    res.json({
        packages: Object.values(CREDIT_PACKAGES)
    });
});

// GET /credits/:userId - Get user credits
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
        console.error('Error fetching credits:', error);
        res.status(500).json({ error: 'Error fetching credits' });
    }
});

// POST /daily-credits - Grant daily credits to user
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
            console.error('Error granting daily credits:', error);
            return res.status(500).json({ error: 'Error granting daily credits' });
        }

        res.json(data);

    } catch (error) {
        console.error('Error processing daily credits:', error);
        res.status(500).json({ error: 'Error processing daily credits' });
    }
});

export default router;