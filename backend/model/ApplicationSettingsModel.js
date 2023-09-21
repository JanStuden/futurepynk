// Require Mongoose
import mongoose from 'mongoose';

const applicationsettingsSchema = mongoose.Schema({
  _id: String,
  databaseInitialized: Boolean,
});

// eslint-disable-next-line func-names
applicationsettingsSchema.pre(['find', 'findOne'], function () {
  this.lean();
});

export default mongoose.model('ApplicationSettings', applicationsettingsSchema);
