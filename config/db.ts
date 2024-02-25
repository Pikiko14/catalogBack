import { connect } from "mongoose";

const dbConnect = async (): Promise<void> => {
    const DB_URI = process.env.APP_ENV == 'develop' ?
        <string>process.env.DB_URI :
        <string>process.env.MONGO_ATLAS_URL;
    await connect(DB_URI);
}

export default dbConnect;