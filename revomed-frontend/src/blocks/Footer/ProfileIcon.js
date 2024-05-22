let ProfileIcon = (props) => {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 21L2 19C2 16.7909 3.79086 15 6 15L6.5 15L9.17157 15C9.43679 15 9.69114 15.1054 9.87868 15.2929C11.0503 16.4645 12.9497 16.4645 14.1213 15.2929C14.3089 15.1054 14.5632 15 14.8284 15L17.5 15L18 15C20.2091 15 22 16.7909 22 19L22 21C22 21.5523 21.5523 22 21 22L3 22C2.44772 22 2 21.5523 2 21Z" fill={props.color} stroke={props.color} strokeWidth="2"/>
<circle cx="12" cy="7" r="5" stroke={props.color} strokeWidth="2"/>
</svg>

	);
}
export default ProfileIcon;