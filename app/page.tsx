// app/page.tsx
"use client";
import { useExplorePublications, PublicationTypes, appId } from '@lens-protocol/react-web';
import Header from './header';
import Link from 'next/link';

export default function Home() {
  // نقوم بإستدعاء المنشورات المتداولة في البروتوكول
  const { data: posts, loading } = useExplorePublications({
    // نقوم بتحديد النوع بحيث يظهر لنا المنشورات فقط وليس التعليقات
    publicationTypes: [PublicationTypes.Post],
    // lenstube-bytes إستدعاء فيديوهات قصيرة من تطبيق
    sources: [appId("lenstube-bytes")],
    // نقوم بإستدعاء 25 من المنشورات
    limit: 25,
  }) as any;

  // قم بمراقبتها من هناك console طباعة المنشورات على
  console.log("posts", posts);

  // إذا مازال يقوم بإستدعاء المنشورات فسيطلب من المستخدم ان ينتظر
  if (loading) return <div className="mx-20 my-10">Loading Posts...</div>

  return (
    <div className='my-4 mx-8'>
      <Header />
      {posts?.map((post: any) => (
        <div className="mb-8" key={post.id}>
          <div className='flex flex-row justify-center items-start gap-4'>
            <div className='flex justify-center items-center w-[50px] h-[50px]'>
              {
                post.profile.picture && post.profile.picture.__typename === 'MediaSet' ? (
                  <Link href={`/${post.profile.handle}`}>
                    <img src={post.profile.picture.original.url} width="50" height="50" className='rounded-full w-[50px] h-[50px]' />
                  </Link>
                ) : <div className="w-[50px] h-[50px] bg-slate-300 rounded-full" />
              }
            </div>
            <div className='flex flex-col w-[50%]'>
              <div className='flex flex-row justify-between'>
                <Link href={`/${post.profile.handle}`}>
                  <div className='flex flex-row justify-start gap-2 text-white'>
                    <div className="text-lg font-black">{post.profile.handle}</div>
                    <div className="text-lg">{post.profile.name}</div>
                  </div>
                </Link>
                <div>
                  <button className="block py-2 px-4 font-medium text-center border border-red-600 text-red-600 bg-black hover:bg-red-100 active:shadow-none rounded-lg shadow md:inline">
                    Follow
                  </button>
                </div>
              </div>
              <div className="mb-2 text-white">
                {post.metadata.content.split("\n").map((i: string, id: number) => (<p key={id}>{i}</p>))}
              </div>
              <div>
                {post.metadata && post.metadata.media[0].__typename === 'MediaSet' ? (
                  <video width="55%" height="70%" className="w-[55%] h-[70%] rounded-lg" controls={true}>
                    <source 
                      src={post.metadata.animatedUrl?.substr(0,4) == "ipfs" ? (
                        `${post.metadata.animatedUrl?.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/')}`
                      ) : post.metadata.animatedUrl} 
                    />
                  </video>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
