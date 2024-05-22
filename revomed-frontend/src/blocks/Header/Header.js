import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client"
import ENVIRONMENT from "../../utils/ENVIRONMENT";
import API from "../../utils/API";

// components
import MobileMenuModal from "./Modals/MobileMenuModal";
import NotificationsModal from "./Modals/NotificationsModal";

// graphics
import logo from './logo.svg';
import menuIcon from './menuIcon.svg';
import notifyIcon from './notifyIcon.svg';

// styles
import './Header.scss';

let Header = (props) => {
	/* 
	props.userIsLoggedIn
	*/

	const [mobileMenuModalIsOpen, setMobileMenuModalIsOpen] = useState(false);
	const [notificationsModalIsOpen, setNotificationsModalIsOpen] = useState(false);
	const [auth, setAuth] = useState(props.userIsLoggedIn);
	const [notificationsArr, setNotificationsArr] = useState([]);
	const [notificationsUnreadMessages, setNotificationsUnreadMessages] = useState(0);
	const [socket, setSocket] = useState();
	const [portalIsReady, setPortalIsReady] = useState(false);
	const [positionStyles, setPositionStyles] = useState(null);

	// MODAL MENU CONTROL
	let openMobileMenuModal = () => setMobileMenuModalIsOpen(true);
	let closeMobileMenuModal = () => setMobileMenuModalIsOpen(false);
	// END OF MODAL MENU CONTROL

	useEffect(() => {
		console.log("notificationsArr", notificationsArr);
	}, [notificationsArr])

	// NOTIFICATIONS
	let openNotificationsModal = () => {
		setNotificationsModalIsOpen(true);
		if(socket) socket.emit("notificationsHaveBeenRead");
		
		setNotificationsUnreadMessages(0);

		let arr = notificationsArr.slice(0);
		arr.forEach((item, i) => {
			arr[i].read = true;
		})
		setNotificationsArr(arr);
	}
	let closeNotificationsModal = () => setNotificationsModalIsOpen(false);

	useEffect(() => {
		if(!auth) return;
		let getNotifications = async () => {
			let res = await API.get('/notifications');
			return await res.data;
		}
		getNotifications().then((result) => {
			if(!result.success) return false;
			console.log("n1", result.notifications);
			setNotificationsArr(result.notifications);
			setNotificationsUnreadMessages(result.notifications.reduce((sum, item) => !item.read ? sum + 1 : sum, 0));
			console.log("nu1", result.notifications.reduce((sum, item) => !item.read ? sum + 1 : sum, 0));
			let socketS = io.connect(ENVIRONMENT.backendURL+"/notify", {withCredentials: 'true'});
			setSocket(socketS);
		})
	}, [auth])

	useEffect(() => {
		if(!socket) return;
		initSockets(socket);
		return () => socket.disconnect();
	}, [socket])

	const headerRef = useRef(null);
	const portalContainerRef = useRef(null);
	useEffect(() => {
		if(!auth) return;
		setPositionStyles({
	      top: headerRef.current.getBoundingClientRect().height,
	      right: portalContainerRef.current.getBoundingClientRect().left - 10
	    })
		let updatePosition = () => {
			setPositionStyles({
				top: headerRef.current.getBoundingClientRect().height,
				right: portalContainerRef.current.getBoundingClientRect().left - 10
			})
		}
		window.addEventListener('resize', updatePosition)
	    return () => window.removeEventListener('resize', updatePosition)
	}, [auth, headerRef, portalContainerRef])

	useEffect(() => {
		if(portalContainerRef) setPortalIsReady(true);
	}, [portalContainerRef])

	let initSockets = (socket) => {
		socket.emit("readyToHearNotifications");
		socket.on("newNotification", (data) => {
			console.log("newNotification", data);

			let arr = notificationsArr.slice(0);
			arr.unshift(data);
			setNotificationsArr(arr);

			setNotificationsUnreadMessages(actualUnread => actualUnread+1);
		})
	}
	// END OF NOTIFICATIONS


	// CHANGE HEADER TYPE (AUTH/NO) WHEN PROP UPDATES
	useEffect(() => {
		setAuth(props.userIsLoggedIn);
	}, [props.userIsLoggedIn])
	// END OF CHANGE HEADER TYPE (AUTH/NO) WHEN PROP UPDATES

	return (
		<>
		<div className="Header bg-primary py-5" ref={headerRef}>
			<div className="container">
				<div className="d-flex justify-content-between align-items-center">
					<div className="hamburger-menu d-md-none col-auto">
						<button className="hamburger-menu__button" onClick={() => openMobileMenuModal()}><img src={menuIcon} alt="" /></button>
					</div>
					<div className="Header__main d-flex align-items-center justify-content-center col-auto">
						<Link to="/" className="logo"><img src={logo} alt="Revomed" /></Link>
						<nav className="menu d-none d-md-block pl-2 pl-md-6">
							<Link to="/" className="d-none d-md-inline mx-2">Главная</Link>
							<Link to="/blog" className="mx-2">Блог</Link>
							<Link to="/catalog" className="mx-2">Каталог <span className="d-none d-md-inline">врачей</span></Link>
							<Link to="/clinics" className="mx-2">Клиники</Link>
						</nav>
					</div>
					<div className="Header__actions d-flex justify-content-end col-auto">
						{!auth ? 
							<div className="enter">
								<Link to="/auth">Вход <span className="d-none d-md-inline">и регистрация</span></Link>
							</div>
						:
							<>
							<div className="enter">
								<Link to="/lk" className="d-none d-md-inline-block mr-4">Личный кабинет</Link>
							</div>
							<div className="open-notify">
								<button className="open-notify__button" onClick={() => openNotificationsModal()}>
									<img src={notifyIcon} alt="" />
									{notificationsUnreadMessages ? <span className="counter d-flex justify-content-center align-items-center">{notificationsUnreadMessages}</span> : ""}
								</button>
							</div>
							</>
						}
					</div>
				</div>
				<div ref={portalContainerRef}></div>
			</div>
		</div>

		<MobileMenuModal 
	    openModal={openMobileMenuModal} 
	    closeModal={closeMobileMenuModal} 
	    isOpen={mobileMenuModalIsOpen} />

{portalIsReady ? 
	    <NotificationsModal
	    	openModal={openNotificationsModal} 
	    	closeModal={closeNotificationsModal} 
	    	isOpen={notificationsModalIsOpen} 
	    	notifications={notificationsArr}
	    	position={positionStyles}
	    	portal={portalContainerRef.current} />
 : "" }
		</>
	);
}

export default Header;

/*
<div className="Header__switcher ml-4 d-none d-lg-flex">
						<a href="#" className="active d-flex align-items-center">РУС</a>
						<a href="#" className="d-flex align-items-center">ENG</a>
					</div>
*/