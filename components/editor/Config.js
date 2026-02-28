const IMAGE_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/content/upload`
const VIDEO_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/content/upload-video`
const FILE_UPLOAD_URL = `${process.env.NEXT_PUBLIC_API_URL}/content/upload-file`

export const editorConfig = (allowPaste = true) => {
	const accessToken = typeof window !== 'undefined' ? localStorage.getItem('_pabson-t_') : '';

	return {
		theme: "snow",
		modules: {
			toolbar: {
				container: [
					[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
					[{ 'font': [] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ 'color': [] }, { 'background': [] }],
					[{ 'script': 'sub' }, { 'script': 'super' }],
					['blockquote', 'code-block'],
					[{ 'list': 'ordered' }, { 'list': 'bullet' }],
					[{ 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }],
					['link', 'image', 'video', 'formula'],
					['clean']
				],
			},
			clipboard: {
				matchVisual: false,
			}
		},
		formats: [
			'header', 'font', 'size',
			'bold', 'italic', 'underline', 'strike', 'blockquote',
			'list', 'bullet', 'indent',
			'link', 'image', 'video', 'color', 'background', 'align'
		],
		placeholder: 'Place Your Content Here!',
		uploadUrls: {
			image: IMAGE_UPLOAD_URL,
			video: VIDEO_UPLOAD_URL,
			file: FILE_UPLOAD_URL
		},
		headers: {
			Authorization: accessToken ? `Bearer ${accessToken}` : '',
		}
	};
};
