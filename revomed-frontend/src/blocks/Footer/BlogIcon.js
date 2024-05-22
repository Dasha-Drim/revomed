let BlogIcon = (props) => {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clipPath="url(#clip0)">
<path d="M1 3C1 1.89543 1.89543 1 3 1H21C22.1046 1 23 1.89543 23 3V21C23 22.1046 22.1046 23 21 23H3C1.89543 23 1 22.1046 1 21V3Z" fill={props.color}/>
<rect x="3.5" y="7.5" width="8" height="7" rx="0.5" stroke="white"/>
<rect x="3" y="17" width="18" height="4" rx="1" fill="white"/>
<rect x="3" y="3" width="18" height="2" rx="1" fill="white"/>
<rect x="14" y="11" width="7" height="1" rx="0.5" fill="white"/>
<rect x="14" y="13" width="7" height="1" rx="0.5" fill="white"/>
</g>
<defs>
<clipPath id="clip0">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>

	);
}
export default BlogIcon;