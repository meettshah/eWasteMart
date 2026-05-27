import {model, models, Schema} from 'mongoose';

const propertySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  values: {
    type: String,
    required: true,
  },
});

const RecyclerSchema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "Login",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  typeWaste: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  description: {
    type: String,
    default: "",
  },
  properties: {
    type: [propertySchema],
    required: true,
  },
}, { timestamps: true });


const Recycler = models.Recycler || model('Recycler', RecyclerSchema);

export default Recycler;
