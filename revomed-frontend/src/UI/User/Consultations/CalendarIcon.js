let CalendarIcon = (props) => {
	return (
		<svg className={props.className} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M15 2.24927H14.25V0.749268H12.75V2.24927H5.24999V0.749268H3.74999V2.24927H3C2.175 2.24927 1.5 2.92427 1.5 3.74927V15.7493C1.5 16.5743 2.175 17.2493 3 17.2493H15C15.825 17.2493 16.5 16.5743 16.5 15.7493V3.74927C16.5 2.92427 15.825 2.24927 15 2.24927ZM15 15.7493H3V5.99927H15V15.7493Z" fill={props.color}/>
		</svg>
	);
}
export default CalendarIcon