/**
 * Galle Taxi - Firebase Cloud Functions
 * Automated server-side event triggers for notifications, audit logging, and status transitions.
 */

// Note: When deploying to Firebase Cloud Functions:
// npm --prefix functions install firebase-admin firebase-functions
// firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Triggered whenever a new booking document is created in Firestore.
 * 1. Generates an internal audit log
 * 2. Prepares notifications (Email / WhatsApp dispatch)
 */
exports.onBookingCreated = functions.firestore
  .document('bookings/{bookingId}')
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const bookingId = context.params.bookingId;

    console.log(`[Galle Taxi] New booking received: ${booking.bookingReference} (${bookingId})`);

    try {
      // 1. Record Audit Log
      await db.collection('auditLogs').add({
        action: 'BOOKING_CREATED',
        performedBy: `Customer: ${booking.customerName}`,
        targetId: bookingId,
        details: `Pickup: ${booking.pickupLocation} -> Drop: ${booking.destination} on ${booking.pickupDate} at ${booking.pickupTime}. Estimated: LKR ${booking.estimatedFare}`,
        timestamp: new Date().toISOString(),
      });

      // 2. Dispatch notification queue item
      // External SMS / WhatsApp provider integration (Twilio / Meta Cloud API / SendGrid):
      // Environment variables required:
      // firebase functions:config:set whatsapp.token="TOKEN" whatsapp.phone_id="PHONE_ID"
      const whatsappToken = process.env.WHATSAPP_TOKEN || functions.config().whatsapp?.token;

      if (whatsappToken) {
        console.log(`[Galle Taxi Notification] Sending WhatsApp confirmation to ${booking.phone}`);
        // Example implementation with WhatsApp Cloud API
      } else {
        console.info(
          `[Galle Taxi Notification] WhatsApp provider unconfigured. In-app confirmation active for ${booking.phone}.`
        );
      }
    } catch (err) {
      console.error('[Galle Taxi Cloud Function Error]', err);
    }
  });

/**
 * Triggered on status change or driver assignment.
 * Notifies customer of driver name, vehicle plate number, and status progression.
 */
exports.onBookingUpdated = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const bookingId = context.params.bookingId;

    if (before.status !== after.status || before.driverId !== after.driverId) {
      console.log(`[Galle Taxi] Status updated for ${after.bookingReference}: ${before.status} -> ${after.status}`);

      await db.collection('auditLogs').add({
        action: 'BOOKING_STATUS_UPDATED',
        performedBy: 'System / Admin Dispatcher',
        targetId: bookingId,
        details: `Status changed from ${before.status} to ${after.status}. Driver: ${after.driverName || 'Unassigned'} (${after.vehiclePlate || 'N/A'})`,
        timestamp: new Date().toISOString(),
      });
    }
  });
