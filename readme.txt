0. install project
    npx create next-app --example with-mongodb nextjs-mongodb

1. run server
    cd nextjs-mongodb
    npm i
    npm run dev

2. Go to mongodb.com

    Create Organization > name : crud-app > cloud service : mongodb atlas > create Organization
    
    Create project > nextjs-crud-app > create project
    
    Database > build a database > free > username : psworamet, password : psworamet123456,
            > My local environment > add my current ip address

    Connect > mongodb for vs code > copy mongodb+srv://psworamet:<password>@cluster0.fcqzfxk.mongodb.net/

    .env.local
        MONGODB_URI=mongodb+srv://psworamet:psworamet123456@cluster0.fcqzfxk.mongodb.net/

3. สร้าง folder 
    components > styles > Nav.module.css

        .navbar{
            border-radius: 1px solid #d4d4d4;
            width: 100%;
            display: flex;
            justify-content: center;
        }

        .navItems ul {
            display: flex;
            justify-content: space-between;
            align-items: center;
            list-style: none;
        }

        .navItems ul li {
            margin-right: 10px;
        }

        .navItems ul li a{
            text-decoration: none;
        }

    components > Nav.tsx

        import React from 'react'
        import styles from './styles/Nav.module.css'

        const Nav = () => {
        return (
            <nav className={styles.navbar}>
                <div className={styles.navItems}>
                    <ul>
                        <li><a href="/">My Posts</a></li>
                        <li><a href="/">Add Posts</a></li>
                    </ul>
                </div>
            </nav>
        )
        }

        export default Nav

    components > Layout.tsx

        import React from 'react'
        import Navbar from './Nav'

        function Layout(props: any) {
        return (
            <div>
            <Navbar/>
                {props.children}
            </div>
        )
        }

        export default Layout


    pages > index.tsx // ใส่ component layout ใน return

        import Layout from '../components/Layout'
        
        return (
        <div className="container">
        <Head>
            <title>Create Next App</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <Layout>
            {/* <h3>hello world </h3> send props */} 
        </Layout>

        <footer>
            <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            >
            Powered by{' '}
            <img src="/vercel.svg" alt="Vercel Logo" className="logo" />
            </a>
        </footer>

4. สร้าง function ตัวจัดการ api เพื่อ getPost.js

    -สร้าง folder pages > api > getPosts.js
    // import clientPromise จาก lib > mongodb.ts เพื่อเข้าถึงฐานข้อมูล

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

    -pages > index.tsx

        import { useState } from 'react'

        type Props = { 
        posts: Post
        }

        type Post = {
        _id: String;
        title: String;
        content: String;
        }

        export async function getServerSideProps(){
            try{
                let response = await fetch('http://localhost:3000/api/getPosts');
                let posts = await response.json();
                return{
                props: {posts: JSON.parse(JSON.stringify(posts))}
                }
            }catch(e){
                console.log(e);
            }
        }

        // ตัวอย่าง let object: {name: string} = {name: 'honda'}
        // let object: {props: [Post]} = {props: {posts: 'jsonValue'}}
        // props ที่รับเข้ามาจาก getServerSideProps ต้องมีค่า posts
        export default function Home(props: Props) {
        
            console.log(Array.isArray(props)); // false
            console.log(Array.isArray(props.posts)); // true

            //ค่าใน props.posts ต้องเป็น _id, title, content
            const [posts, setPosts] = useState<Post>(props.posts)

            return (
                <div className="container">
                <Head>
                    <title>Create Next App</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <Layout>
                    {/* <h3>hello world </h3> send props */} 
                    <div className='posts-body'>
                    <h1 className='posts-body-heading'>Top 20 posts</h1>
                    {posts?.length > 0 ? (
                        <ul className='posts-list'>
                        {posts.map((post, index) => {
                            return (
                            <li key={index} className='post-item'>
                                <div className='post-item-details'>
                                <h2>{post.title}</h2>
                                <p>{post.content}</p>
                                </div>
                                <div className='post-item-actions'>
                                <a href="#">Edit</a>
                                <button>Delete</button>
                                </div>
                            </li>
                            )
                        })}
                        </ul>
                    )
                    :
                    (
                        <h2 className='posts-body-heading'>Ooops ! No posts... </h2>
                    )}
                    </div>
                </Layout>
            )  
        }

5. สร้าง api สำหรับ addPost
//ทำการแก้ไข <li><a href="/posts">Add Posts</a></li> ใน components > Nav.tsx
    
    -pages > api > addPost.js

        import clientPromise from "../../lib/mongodb";

        export default async (req, res) => {
            try{
                const client = await clientPromise;
                const db = client.db("posts");
                const {title, content} = req.body;

                const post = await db.collection('posts').insertOne({
                    title,
                    content
                })
                res.json(post);
            }catch(e){
                console.error(e);
                throw new Error(e).message;
            }
        }

    -pages > posts > index.tsx
    //สร้าง form สำหรับ addPost

        import React, { useState } from 'react'
        import Layout from '../../components/Layout'

        function index() {
            const [title, setTitle] = useState("");
            const [content, setContent] = useState("");
            const [error, setError] = useState("");
            const [message, setMessage] = useState("");

            const handleSubmit = async (e:any) => {
                e.preventDefault();
                if(title && content){
                    try{

                        let response = await fetch('http://localhost:3000/api/addPost',{
                            method: 'POST',
                            body: JSON.stringify({
                                title,
                                content
                            }),
                            headers: {
                                Accept: "application/json', text/plain, */*",
                                "Content-Type": "application/json"
                            }
                        })

                        response = await response.json();

                        setTitle("")
                        setContent("")
                        setError("")
                        setMessage("Post added successfully")

                    }catch(errorMessage: any){
                        setError('All fields are required')
                    }
                }else{
                    return setError('All fields are required')
                }
            }

            return (
                <Layout>
                <form className='form' onSubmit={handleSubmit}>
                    {error ? <div className='alert-error'>{error}</div> : null}
                    {message ? <div className='alert-message'>{message}</div> : null}
                    <div className='form-group'>
                        <label htmlFor='title'>Title</label>
                        <input
                            name='title'
                            type='text'
                            placeholder='Title of the post'
                            onChange={(e) => setTitle(e.target.value)}
                            value={title}
                        >
                        </input>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="content">Content</label>
                        <textarea
                            name='content'
                            placeholder='Content of the post'
                            cols={20}
                            rows={8}
                            onChange={(e) => setContent(e.target.value)}
                            value={content}
                        >
                        </textarea>
                    </div>
                    <div className='form-group'>
                        <button type='submit' className='submit_btn'>Add Post</button>
                    </div>
                </form>
                <style jsx>
                    {`
                        .form{
                            width: 400px;
                            margin: 10px auto;
                        }

                        .form-group{
                            width: 100%;
                            margin-bottom: 10px;
                            display: block;
                        }

                        .form-group label{
                            display: block;
                            margin-bottom: 10px
                        }

                        .form-group input[type="text"], .form-group textarea{
                            padding: 10px;
                            width: 100%;
                        }

                        .alert-error{
                            width: 100%;
                            color: red;
                            margin-bottom: 10px;
                        }

                        .alert-message{
                            width: 100%;
                            color: green;
                            margin-bottom: 10px;
                        }
                    `}
                </style>
                </Layout>
            )
        }

        export default index

6. สร้าง api สำหรับ แก้ไข post
    
    -page > index.tsx ทำการเพิ่ม id ของ post เมื่อคลิก Edit
    // <a href={`/posts/${post._id}`}>Edit</a>

        <Layout>
            {/* <h3>hello world </h3> send props */} 
            <div className='posts-body'>
            <h1 className='posts-body-heading'>Top 20 posts</h1>
            {posts?.length > 0 ? (
                <ul className='posts-list'>
                {posts.map((post, index) => {
                    return (
                    <li key={index} className='post-item'>
                        <div className='post-item-details'>
                        <h2>{post.title}</h2>
                        <p>{post.content}</p>
                        </div>
                        <div className='post-item-actions'>
                        <a href={`/posts/${post._id}`}>Edit</a>
                        <button>Delete</button>
                        </div>
                    </li>
                    )
                })}
                </ul>
            )
            :
            (
                <h2 className='posts-body-heading'>Ooops ! No posts... </h2>
            )}
            </div>
        </Layout>

    -pages > api > getPost.js

        import clientPromise from '../../lib/mongodb'
        import {ObjectId} from 'mongodb'

        export default async (req, res) => {
            try{
                
                const client = await clientPromise;
                const db = client.db('posts');
                const {id} = req.query;

                const post = await db.collection('posts').findOne({
                    _id: ObjectId(id)
                })
                console.log(res.json(post));
                res.json(post);

            }catch(e){
                console.error(e);
                throw new Error(e).message
            }
        }

    -pages > api > editPost.js

        import clientPromise from '../../lib/mongodb'
        import {ObjectId} from 'mongodb'

        export default async(req, res) => {
            try{
                const client = await clientPromise;
                const db = client.db('posts');
                const {id} = req.query;
                const {title, content} = req.body;
                const post = await db.collection('posts').updateOne(
                    {
                        _id: ObjectId(id)
                    },
                    {
                        $set: {
                            title: title,
                            content: content
                        }
                    }
                )
                res.json(post);

            }catch(e){
                console.log(e);
                throw new Error(e).message
            }
        }

    -pages > posts > [id].tsx

        import React, { useState } from 'react'
        import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
        import type { GetStaticPathsResult } from 'next'
        import Layout from '../../components/Layout'

        type PageParams = {
            id: string;
        }

        type ContentPageProps = {
            post: Post;
        }

        type Post =  {
            _id: string;
            title: string;
            content: string;
        }

        type ResponseFromServer = {
            _id: string;
            title: string;
            content: string;
        }
            
        export const getStaticProps = async ({params}:GetStaticPropsContext<PageParams>): Promise<GetStaticPropsResult<ContentPageProps>> => {
            try{

                let response = await fetch('http://localhost:3000/api/getPost?id=' + params?.id)
                
                let responseFromServer: ResponseFromServer = await response.json()

                return{
                    props: {
                        post: {
                            _id: responseFromServer._id,
                            title: responseFromServer.title,
                            content: responseFromServer.content,
                        }
                    }
                }
            }catch(e){
                console.log('error', e);
                return {
                    props: {
                        post: {
                            _id: "",
                            title: "",
                            content: ""
                        }
                    }
                }
            }
        }

        export const getStaticPaths = async(): Promise<GetStaticPathsResult<PageParams>> => {
            let posts = await fetch("http://localhost:3000/api/getPosts");

            let postFromServer: [Post] = await posts.json();

            return {
                paths: postFromServer.map((post) => {
                    return {
                        params: {
                            id: post._id
                        }
                    }
                }),
                fallback: false
            }
        }

        function EditPost({post: {_id, title, content} }:ContentPageProps) {

            const [postTitle, setPostTitle] = useState(title);
            const [postContent, setPostContent] = useState(content);
            const [error, setError] = useState("");
            const [message, setMessage] = useState("");

            const handleSubmit = async (e: any) => {
                e.preventDefault();
                if(postTitle && postContent){
                    try{
                        let response = await fetch('http://localhost:3000/api/editPost?id='+_id,{
                            method: "POST",
                            body: JSON.stringify({
                                title: postTitle,
                                content: postContent
                            }),
                            headers: {
                                Accept: "application/json, text/plain, */*",
                                "Content-Type" : "application/json"
                            }
                        })
                        response = await response.json()
                        setPostTitle("")
                        setPostContent("")
                        setError("")
                        setMessage("Post edited successfully")

                    }catch(errorMessage: any){
                        setError(errorMessage)
                    }
                }else{
                    return setError('All fields are required')
                }
            }
        
            return (
                <Layout>
                <form className='form' onSubmit={handleSubmit}>
                    {error ? <div className='alert-error'>{error}</div> : null}
                    {message ? <div className='alert-message'>{message}</div> : null}
                    <div className='form-group'>
                        <label htmlFor='title'>Title</label>
                        <input
                            name='title'
                            type='text'
                            placeholder='Title of the post'
                            onChange={(e) => setPostTitle(e.target.value)}
                            value={postTitle ? postTitle : ""}
                        >
                        </input>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="content">Content</label>
                        <textarea
                            name='content'
                            placeholder='Content of the post'
                            cols={20}
                            rows={8}
                            onChange={(e) => setPostContent(e.target.value)}
                            value={postContent ? postContent : ""}
                        >
                        </textarea>
                    </div>
                    <div className='form-group'>
                        <button type='submit' className='submit_btn'>Update Post</button>
                    </div>
                </form>
                <style jsx>
                    {`
                        .form{
                            width: 400px;
                            margin: 10px auto;
                        }

                        .form-group{
                            width: 100%;
                            margin-bottom: 10px;
                            display: block;
                        }

                        .form-group label{
                            display: block;
                            margin-bottom: 10px
                        }

                        .form-group input[type="text"], .form-group textarea{
                            padding: 10px;
                            width: 100%;
                        }

                        .alert-error{
                            width: 100%;
                            color: red;
                            margin-bottom: 10px;
                        }

                        .alert-message{
                            width: 100%;
                            color: green;
                            margin-bottom: 10px;
                        }
                    `}
                </style>
                </Layout>
            )
        }

        export default EditPost

7. สร้าง api สำหรับ delete post

    -pages > api > deletePost.js

        import clientPromise from '../../lib/mongodb'
        import {ObjectId} from 'mongodb'

        export default async (req, res) =>{
            try{
                const client = await clientPromise;
                const db = client.db('posts');
                const {id} = req.query;

                const post = await db.collection("posts").deleteOne({
                    _id: ObjectId(id)
                })
                res.json(post);
            }catch(e){
                console.log(e);
            }
        }

    -pages > index.tsx // เพิ่ม function hangleDeletePost, เพิ่ม event onClick

        const handleDeletePost = async (postId: string) => {
            try{
                let response = await fetch("http://localhost:3000/api/deletePost?id=" + postId, {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json, text/plain, */*',
                    "Content-Type": "application/json"
                    }
                })
                response = await response.json()
                window.location.reload();
            }catch(error){
                console.log("An error occured while deleting", error);
            }
        }

        <button onClick={()=>handleDeletePost(post._id as string)}>Delete</button>