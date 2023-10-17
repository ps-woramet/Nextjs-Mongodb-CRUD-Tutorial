import clientPromise from '../../lib/mongodb'

export default async (req, res) => {
    try{
        const client = await clientPromise;
        const db = client.db("posts");

        // .find({}) ใช้เพื่อดึงข้อมูลทุกตัว
        // .limit(20) ดึง20ข้อมูลแรก
        const posts = await db.collection('posts').find({}).limit(20).toArray();
        res.json(posts);

    }catch(e){
        console.error(e);
        throw new Error(e).message;
    }

}