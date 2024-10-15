import mongoose from 'mongoose';

// Mongoose schema and model
const trackingSchema = new mongoose.Schema({
    business: String,
    trackingNumber: String,
});

const Tracking = mongoose.model('Tracking', trackingSchema);

export const connectToMongoDB = async () => {
    await mongoose.connect('mongodb://localhost:27017/purotest');
};

export const uploadToMongoDB = async (businesses, trackingNumbers) => {
    await connectToMongoDB();

    try {
        const dataToInsert = businesses.map((business, index) => ({
            business,
            trackingNumber: trackingNumbers[index],
        }));

        const result = await Tracking.insertMany(dataToInsert);
        console.log(`${result.length} documents were inserted`);
    } catch (err) {
        console.error('Error inserting into MongoDB:', err);
    } finally {
        mongoose.connection.close();
    }
};