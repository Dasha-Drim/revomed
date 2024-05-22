// styles
import './LkUnconfirmed.scss';

let LkUnconfirmed = (props) => {

  // AUTH METHOD
  let auth = props.useAuth();
  // END OF AUTH METHOD

  return (
    <div className="LkUnconfirmed">

    	<div className="container py-7">

      	<div className="row pb-7">
					<div className="col-8">
						<div className="unconfirmed-info text-center py-7 px-5 px-sm-7">
              <div className="py-7 px-md-7 mx-lg-7">
                <h1>Ваш аккаунт ещё не подтверждён</h1>
                <p className="mt-4">Вы успешно вошли в свой аккаунт, но он ещё не одобрен модератором. Дождитесь email-уведомления об окончании проверки аккаунта, после этого вы сможете начать пользоваться системой</p>
              </div>
            </div>
      		</div>
      	</div>

      	<div className="row pb-7">
					<div className="col-8">
						<div className="exit">
							<button className="ui-secondary-button w-100 py-4" onClick={() => auth.signout(() => {})}>Выйти из аккаунта</button>
						</div>
					</div>
				</div>

     
      </div>

    </div> 
  );
}

export default LkUnconfirmed;
