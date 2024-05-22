let ClinicsIcon = (props) => {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M18 9.0001L17.9999 9L13.0367 12.1583C12.7092 12.3668 12.2905 12.3668 11.963 12.1583L7 9L6 9.58333V23H18V9.0001ZM19 23H22C22.5523 23 23 22.5523 23 22V13.0207C23 12.6943 22.8408 12.3886 22.5735 12.2014L19 9.70008V23ZM1 22V13.0744C1 12.7187 1.18891 12.3898 1.49613 12.2106L5 10.1667V23H2C1.44772 23 1 22.5523 1 22Z" fill={props.color}/>
<rect x="6" y="1" width="12" height="15" rx="2" fill={props.color}/>
<rect x="11" y="9" width="2" height="6" fill="white"/>
<rect x="15" y="11" width="2" height="6" transform="rotate(90 15 11)" fill="white"/>
</svg>

	);
}
export default ClinicsIcon;