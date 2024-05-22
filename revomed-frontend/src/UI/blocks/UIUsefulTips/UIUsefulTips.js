import { useState, useEffect } from "react";
import API from "../../../utils/API";

// components
import BigLoadingState from "../../../elements/BigLoadingState/BigLoadingState";

// graphics
import catalogIcon from "./catalogIcon.svg";
import calendarIcon from "./calendarIcon.svg";
import clockIcon from "./clockIcon.svg";

//styles
import './UIUsefulTips.scss';

let UIUsefulTips = (props) => {
	const [consultationDurationString, setConsultationDurationString] = useState(null);
	const [doesAccountHasShopID, setDoesAccountHasShopID] = useState(null);

	useEffect(() => {
		let getCategoriesDuration = async (data) => {
			let res = await API.get('/categories'+(props.userType !== "clinic" ? "/"+props.userId : ""), data);
			return await res.data;
		}
		getCategoriesDuration().then((result) => {
			if(!result.success) return;
			if(result.category) setConsultationDurationString(result.category.duration + " мин");
			if(result.categories) setConsultationDurationString(result.categories.reduce((prev, curr) => (prev + curr.title + " — " + curr.duration + " мин, "), "").slice(0, -2));
		})
		let getShopID = async (data) => {
			let res = await API.get(props.userType === "clinic" ? "/clinics/shopID" : "/doctors/shopID", data);
			return await res.data;
		}
		getShopID().then((result) => {
			if(!result.success) return;
			setDoesAccountHasShopID(!!result.shopID);
		})
	}, [props.userType])

	let tips = {
		doctor: [
			{
				icon: clockIcon,
				heading: `Длительность консультации по вашему профилю — ${consultationDurationString}`,
				description: "Обратите на это внимание при установке расписания и стоимости консультации"
			},
			{
				icon: catalogIcon,
				heading: "Без действующего расписания и подключения к ЮКассе вы не будете показаны в каталоге",
				description: "При этом, ваша публичная страница останется доступна для всех посетителей"
			},
			{
				icon: calendarIcon,
				heading: "Расписание переносится из недели в неделю автоматически",
				description: "Уже забронированные записи нельзя изменить, поэтому заблаговременно позаботьтесь о своём отсутствии"
			}
		],
		clinicDoctor: [
			{
				icon: clockIcon,
				heading: `Длительность консультации по вашему профилю — ${consultationDurationString}`,
				description: "Обратите на это внимание при установке расписания"
			},
			{
				icon: catalogIcon,
				heading: "Без действующего расписания и подключения клиники к ЮКассе вы не будете показаны в каталоге",
				description: "При этом, ваша публичная страница останется доступна для всех посетителей"
			},
			{
				icon: calendarIcon,
				heading: "Расписание переносится из недели в неделю автоматически",
				description: "Уже забронированные записи нельзя изменить, поэтому заблаговременно позаботьтесь о своём отсутствии"
			}
		],
		clinic: [
			{
				icon: clockIcon,
				heading: "Длительность консультаций по разным направлениям",
				description: consultationDurationString
			},
			{
				icon: catalogIcon,
				heading: "Не забудьте загрузить информацию о клинике в разделе \"Редактировать профиль\"",
				description: "Клиники с незаполненной информацией не показываются в каталоге"
			}
		]
	};

	return (
		<div className="UIUsefulTips">
			<div className="mb-4">
				<h2 className="ui-section-heading mb-0">Полезная информация</h2>
			</div>
			<div className="content row mx-0 px-5 px-sm-7 py-6">
				{doesAccountHasShopID !== null ? <>
					{doesAccountHasShopID ?
						<span className="good py-2 px-3 d-inline-block mb-5">Аккаунт успешно подключён к ЮКассе</span>
					: <span className="warning py-2 px-3 d-inline-block mb-5">Аккаунт ещё подключается к ЮКассе</span>}
				</> : ""}
				{consultationDurationString ? tips[props.userType].map((item, key) =>
				<div key={key} className={"tip w-100 d-flex align-items-start align-content-start align-items-md-center align-content-md-center"+(key !== tips[props.userType].length-1 ? " mb-6" : "")}>
					<img src={item.icon} className="tip__icon" alt="" />
					<div className="ml-6">
						<h2 className="tip__heading">{item.heading}</h2>
						<p className="tip_description mb-0">{item.description}</p>
					</div>
				</div>
				) : <BigLoadingState text="Загружаем полезную информацию" />}
			</div>
		</div>
	);
}

export default UIUsefulTips;