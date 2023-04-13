import mongoose from "mongoose";

const connectDB = (url) => {
	//this is useful when working with search functionality
	mongoose.set("strictQuery", true);

	//connect to the database
	mongoose
		.connect(url)
		.then(() => console.log("MongoDB connected"))
		.catch((err) => console.log(err));
};

export default connectDB;
