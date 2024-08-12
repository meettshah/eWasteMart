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
  name: {
    type: String,
    required: true,
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
    required: true,
  },
  properties: {
    type: [propertySchema],
    required: true,
  },
});


const Recycler = models.Login || model('Recycler', RecyclerSchema);

export default Recycler;