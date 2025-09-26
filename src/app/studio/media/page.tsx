import MediaLibrary from '@/app/studio/media/MediaLibrary'
import { getImages } from '@/app/studio/media/media-actions'

export default async function PageMediaLibrary() {
    return <div className="p-16">
        <h1 className="text-2xl mb-3">媒体库</h1>
        <MediaLibrary init={await getImages(0)}/>
    </div>
}
