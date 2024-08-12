import { NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mongooseConnect } from '@/lib/mongoose';

const links = [];
const uploadHandler = async (req) => {
  await mongooseConnect();

  const data = await req.formData();
  const files = data.get('file');

  if (!files) {
    return NextResponse.json({ message: "File Not Uploaded" });
  }

  const bytes = await files.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });

  const ext = files.name.split('.').pop();

  const newFilename = Date.now() + '.' + ext;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: newFilename,
    Body: buffer,
    ContentType: files.type,
    ACL: 'public-read',
  };

  await client.send(new PutObjectCommand(params));
  const link = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${newFilename}`;
  links.push(link);

  return NextResponse.json({ message: "File Uploaded", links });
}




export { uploadHandler as POST }