import { Link, useLocation } from "react-router-dom";

// graphics
import logo from './logo.svg';
import ProfileIcon from './ProfileIcon.js';
import CatalogIcon from './CatalogIcon.js';
import ClinicsIcon from './ClinicsIcon.js';
import BlogIcon from './BlogIcon.js';

// styles
import './Footer.scss';

let Footer = () => {
	const location = useLocation();
	return (
		<>
		<div className="Footer pt-7 pb-2 d-none d-md-block">
			<div className="container d-flex flex-wrap justify-content-between align-items-top pt-5">
				<div className="Footer__about-company text-center text-md-left d-flex flex-wrap flex-column align-items-center align-items-md-start pb-5 order-2 order-md-0 pt-5 pt-md-0">
					<img className="pb-3" src={logo} alt="Revomed" />
					<p className="d-md-none d-lg-inline">REVOMED - сервис онлайн телемедицины с проверенными <br />врачами. Консультации в видео-чате.</p>
					<p>ООО «Ревомед» <br/>ИНН 7702374507, ОГРН 1157746013611</p>
					<Link to="/politics" className="d-block Footer__agreement-link">Соглашение о персональных данных</Link> 
					<Link to="/agreement" className="d-block Footer__agreement-link pb-3">Пользовательское соглашение</Link>
					<a href="https://amont.studio" className="d-block Footer__studio-link">Разработка Amont.studio</a>
				</div>
				<div className="Footer__nav d-flex flex-column align-items-center align-items-md-start pb-5">
					<span className="pb-4">Навигация</span>
					<Link to="/blog">Блог</Link>
					<Link to="/catalog">Врачи-консультанты</Link>
					<Link to="/clinics">Клиники</Link>
					<Link to="/auth">Регистрация</Link>
				</div>
				<div className="Footer__nav d-flex flex-column align-items-center align-items-md-start pb-5">
					<span className="pb-4">Работа с сервисом</span>
					<Link to="/reg/doc">Стать врачом</Link>
					<Link to="/reg/clinic">Стать клиникой</Link>
					<Link to="/auth/sellers">Вход для врачей</Link>
				</div>
				<div className="Footer__nav d-flex flex-column align-items-center align-items-md-start">
					<span className="pb-4">Социальные сети</span>
					<a href="https://vk.com/club197257502">ВКонтакте</a>
					<a href="https://www.instagram.com/revomed.live/">Instagram</a>
					<a href="https://www.facebook.com/Revomed-105987984537751">Facebook</a>
					<a href="https://www.youtube.com/channel/UCHTCUZDuFAbcG7OVuVGllxA?view_as=subscriber">YouTube</a>
				</div>
				<div className="w-100 text-center pt-7">
					<span className="warning">ИМЕЮТСЯ ПРОТИВОПОКАЗАНИЯ. НЕОБХОДИМА КОНСУЛЬТАЦИЯ СПЕЦИАЛИСТА.</span>
				</div>
			</div>
			
		</div>

		<div className="spacer pt-7 d-md-none"></div>
		<div className="menutabs d-flex d-md-none justify-content-around w-100 py-4 px-4">
			<Link to="/lk" className={"menutabs-item d-flex flex-column align-items-center text-center "+(location.pathname === "/lk" ? "active" : "")}>
				<ProfileIcon color={location.pathname === "/lk" ? "#6D71F9" : "#C2C3DA"} />
				<span className="menutabs-item__name pt-1">Профиль</span>
			</Link>
			<Link to="/catalog" className={"menutabs-item d-flex flex-column align-items-center text-center "+(location.pathname === "/catalog" ? "active" : "")}>
				<CatalogIcon color={location.pathname === "/catalog" ? "#6D71F9" : "#C2C3DA"} />
				<span className="menutabs-item__name pt-1">Каталог</span>
			</Link>
			<Link to="/clinics" className={"menutabs-item d-flex flex-column align-items-center text-center "+(location.pathname === "/clinics" ? "active" : "")}>
				<ClinicsIcon color={location.pathname === "/clinics" ? "#6D71F9" : "#C2C3DA"} />
				<span className="menutabs-item__name pt-1">Клиники</span>
			</Link>
			<Link to="/blog" className={"menutabs-item d-flex flex-column align-items-center text-center "+(location.pathname === "/blog" ? "active" : "")}>
				<BlogIcon color={location.pathname === "/blog" ? "#6D71F9" : "#C2C3DA"} />
				<span className="menutabs-item__name pt-1">Блог</span>
			</Link>
		</div>
		</>
	);
}

export default Footer;
