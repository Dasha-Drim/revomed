import React, { useState, useEffect, useContext, createContext, lazy, Suspense } from 'react';
import { BrowserRouter as Router,
  Switch,
  Route,
  Redirect } from 'react-router-dom';

import API from "./utils/API";
import ScrollToTop from "./utils/ScrollToTop";
import { DateTime } from 'luxon';
import SEO from "./utils/SEO";
//import BigLoadingState from "./elements/BigLoadingState/BigLoadingState";

import './App.scss';

// components

const Header = lazy(() => import('./blocks/Header/Header'));
const Footer = lazy(() => import('./blocks/Footer/Footer'));

const Home = lazy(() => import('./pages/Home'));
const Blog = lazy(() => import('./pages/Blog'));
const Post = lazy(() => import('./pages/Post'));
const Catalog = lazy(() => import('./pages/Catalog'));
const CatalogClinic = lazy(() => import('./pages/CatalogClinic'));
const Doctor = lazy(() => import('./pages/Doctor'));
const Clinic = lazy(() => import('./pages/Clinic'));
const Checkup = lazy(() => import('./pages/Checkup'));
const RegDoc = lazy(() => import('./pages/RegDoc'));
const RegClinic = lazy(() => import('./pages/RegClinic'));
const Auth = lazy(() => import('./pages/Auth'));
const AuthSellers = lazy(() => import('./pages/AuthSellers'));
const ForgetPassword = lazy(() => import('./pages/ForgetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const LkUser = lazy(() => import('./pages/LkUser'));
const LkUnconfirmed = lazy(() => import('./pages/LkUnconfirmed'));
const LkBlocked = lazy(() => import('./pages/LkBlocked'));
const LkDoc = lazy(() => import('./pages/LkDoc'));
const LkClinic = lazy(() => import('./pages/LkClinic'));
const ClinicCheckup = lazy(() => import('./pages/ClinicCheckup'));
const ClinicPromo = lazy(() => import('./pages/ClinicPromo'));
const DoctorPromo = lazy(() => import('./pages/DoctorPromo'));
const EditCheckup = lazy(() => import('./pages/EditCheckup'));
const EditPromo = lazy(() => import('./pages/EditPromo'));
const EditPromoDoctor = lazy(() => import('./pages/EditPromoDoctor'));
const LkUserEdit = lazy(() => import('./pages/LkUserEdit'));
const LkDocEdit = lazy(() => import('./pages/LkDocEdit'));
const LkClinicEdit = lazy(() => import('./pages/LkClinicEdit'));
const Politics = lazy(() => import('./pages/Politics'));
const Agreement = lazy(() => import('./pages/Agreement'));
const RoomDoc = lazy(() => import('./pages/RoomDoc'));
const RoomUser = lazy(() => import('./pages/RoomUser'));
const WriteReview = lazy(() => import('./pages/WriteReview'));
const WriteRecommendation = lazy(() => import('./pages/WriteRecommendation'));
const Meeting = lazy(() => import('./pages/Meeting'));
const NoMatch = lazy(() => import('./pages/NoMatch'));
const ContinueBooking = lazy(() => import('./pages/ContinueBooking'));


const LkFarm = lazy(() => import('./pages/LkFarm'));
const LkFarmEdit = lazy(() => import('./pages/LkFarmEdit'));
const FarmBanners = lazy(() => import('./pages/FarmBanners'));
const FarmArticles = lazy(() => import('./pages/FarmArticles'));
const FarmProducts = lazy(() => import('./pages/FarmProducts'));
const EditBanners = lazy(() => import('./pages/EditBanners'));
const EditArticles = lazy(() => import('./pages/EditArticles'));
const EditProducts = lazy(() => import('./pages/EditProducts'));
const Subcategory = lazy(() => import('./pages/Subcategory'));
const Article = lazy(() => import('./pages/Article'));
const Product = lazy(() => import('./pages/Product'));


// GET USERS
let getUsers = async () => {
    let data = {timezone: DateTime.now().zoneName};
    let res = await API.get('/users', {params: data});
    return await res.data;
}
// END OF GET USERS


const authContext = createContext();

function ProvideAuth({ children }) {
    let [userData, setUserData] = useState({userType: null, userId: null, userInfo: null});

    useEffect(() => {
        getUsers().then(res => {
            if(res.success) setUserData({userType: res.type, userId: res.id, userInfo: res.info});
            else setUserData({userType: "vizitor", userId: null, userInfo: null});
        })
        //setUserData({userType: "vizitor", userId: null, userInfo: null});
    }, [])


    let auth = {
        userType: userData.userType,
        userId: userData.userId,
        userInfo: userData.userInfo,
        signin: (cb) => {
            getUsers().then(res => {
                if(res.success) setUserData({userType: res.type, userId: res.id, userInfo: res.info});
                else setUserData({userType: "vizitor", userId: null, userInfo: null});
                cb();
            })
        },
        signout: (cb) => {
            let cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i];
                let eqPos = cookie.indexOf("=");
                let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
            setUserData({userType: "vizitor", userId: null, userInfo: null});
        },
        reconfirm: (cb) => {
          getUsers().then(res => {
                if(res.success) setUserData({userType: res.type, userId: res.id, userInfo: res.info});
                else setUserData({userType: "vizitor", userId: null, userInfo: null});
                cb();
            })
        }
    }



    if(userData.userType && (userData.userId !== null || userData.userType === "vizitor")) return (
        <authContext.Provider value={auth}>
            {children}
        </authContext.Provider>
    );
    else return (
        <div className="main-loader"></div>
    );
  
}

function useAuth() {
  return useContext(authContext);
}


function AuthButton() {
  let auth = useAuth();
  return auth.userType && auth.userType !== "vizitor" ? (
    <Header userIsLoggedIn={true} />
  ) : (
    <Header userIsLoggedIn={false} />
  );
}

// возвращает куки с указанным name
// или undefined, если ничего не найдено
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  let auth = useAuth();
  let cookieMatch = getCookie("bookingInfo");
  console.log("cookieMatch", cookieMatch);
  console.log("auth.userId", rest.computedMatch);
  console.log("rest", rest);
  console.log("children", children);
  if ((rest.computedMatch.path == "/write/review/:link") && (auth.userType && auth.userType === "vizitor")) {
    document.cookie = "linkReview=" + rest.location.pathname;
  }
  let cookieMatchReview = getCookie("linkReview");
  return (
    <Route
      {...rest}
      render={({ location }) =>
        (auth.userType && auth.userType !== "vizitor") ? (
          (!auth.userInfo.name && auth.userType === "client") ? (
            <Redirect
              to={{
                pathname: "/meeting",
                state: { from: location }
              }}
            />
          ) : [children].flat().findIndex(item => item.props.userType === auth.userType) !== -1 ? (
            React.cloneElement([children].flat().find(item => item.props.userType === auth.userType), { userId: auth.userId, userInfo: auth.userInfo, match: rest.computedMatch })
          ) : cookieMatch ? (
            <Redirect
              to={{
                pathname: "/continue-booking",
                state: { from: location }
              }}
            />
          ) : (
            <Redirect
              to={{
                pathname: "/continue-booking",
                state: { from: location }
              }}
            />
          )
        ) : (
          <Redirect
            to={{
              pathname: "/auth",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

/*document.cookie = "bookingInfo=" + props.docId;*/

let App = () => {

  return (
    <Router>
    <Suspense fallback={<div className="main-loader"></div>}>
      <div className="App">
        <ProvideAuth>
          <SEO pageProps={{
            title: "Revomed.ru - телемедицинский сервис для женщин"}} 
          />
          <AuthButton />
          <Switch>

            

            <Route exact path="/" component={Home} />
            <Route exact path="/blog" component={Blog} />

            <Route exact path="/post/:postId" component={Post} />

            <Route exact path="/catalog" component={Catalog} />
            <Route exact path="/doctor/:docId" component={Doctor} />

            <Route exact path="/clinics" component={CatalogClinic} />
            <Route exact path="/clinic/:clinicId" component={Clinic} />
            <Route exact path="/checkup/:checkupId" component={Checkup} />

            <Route exact path="/reg/doc/:clinicLink" component={RegDoc} />
            <Route exact path="/reg/doc" component={RegDoc} />
            <Route exact path="/reg/clinic" component={RegClinic} />

            <Route exact path="/auth">
              <Auth useAuth={useAuth} />
            </Route>
            <Route exact path="/auth/sellers">
              <AuthSellers useAuth={useAuth} />
            </Route>
            <Route exact path="/meeting">
              <Meeting useAuth={useAuth} />
            </Route>
            <Route exact path="/password/forget" component={ForgetPassword} />
            <Route exact path="/password/recovery/:link" component={ChangePassword} />
            
            <Route exact path="/continue-booking">
              <ContinueBooking useAuth={useAuth} />
            </Route>
            
            <PrivateRoute path="/lk/edit">
              <LkUserEdit userType="client" useAuth={useAuth} />
              <LkDocEdit userType="doctor" useAuth={useAuth} />
              <LkDocEdit userType="clinicDoctor" useAuth={useAuth} />
              <LkClinicEdit userType="clinic" useAuth={useAuth} />
              <LkFarmEdit userType="farm" useAuth={useAuth} />
            </PrivateRoute>

            <PrivateRoute path="/lk/checkup/edit/:checkupId">
              <EditCheckup userType="clinic" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/checkup/edit">
              <EditCheckup userType="clinic" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/checkup">
              <ClinicCheckup userType="clinic" useAuth={useAuth} />
            </PrivateRoute>

            <PrivateRoute path="/lk/promo/edit/:promoId">
              <EditPromo userType="clinic" useAuth={useAuth} />
              <EditPromoDoctor userType="doctor" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/promo/edit">
              <EditPromo userType="clinic" useAuth={useAuth} />
              <EditPromoDoctor userType="doctor" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/promo">
              <ClinicPromo userType="clinic" useAuth={useAuth} />
              <DoctorPromo userType="doctor" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/subcategory/:url">
              <Subcategory userType="client" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/article/:id">
              <Article userType="client" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/product/:id">
              <Product userType="client" useAuth={useAuth} />
            </PrivateRoute>


            
            <PrivateRoute path="/lk/banners/edit/:id">
              <EditBanners userType="farm" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/banners/edit">
              <EditBanners userType="farm" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/banners">
              <FarmBanners userType="farm" useAuth={useAuth} />
            </PrivateRoute>

            
            <PrivateRoute path="/lk/articles/edit/:id">
              <EditArticles userType="farm" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/articles/edit">
              <EditArticles userType="farm" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/articles">
              <FarmArticles userType="farm" useAuth={useAuth} />
            </PrivateRoute>

            
            <PrivateRoute path="/lk/products/edit/:id">
              <EditProducts userType="farm" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/products/edit">
              <EditProducts userType="farm" useAuth={useAuth} />
            </PrivateRoute>
            <PrivateRoute path="/lk/products">
              <FarmProducts userType="farm" useAuth={useAuth} />
            </PrivateRoute>
            

            <PrivateRoute path="/lk">
              <LkUser userType="client" useAuth={useAuth} />
              <LkDoc userType="doctor" useAuth={useAuth} />
              <LkDoc userType="clinicDoctor" useAuth={useAuth} />
              <LkClinic userType="clinic" useAuth={useAuth} />
              <LkUnconfirmed userType="unconfirmed" useAuth={useAuth} />
              <LkBlocked userType="blocked" useAuth={useAuth} />
              <LkFarm userType="farm" useAuth={useAuth} />
            </PrivateRoute>



            <PrivateRoute path="/room/:link">
              <RoomUser userType="client" useAuth={useAuth} />
              <RoomDoc userType="doctor" useAuth={useAuth} />
              <RoomDoc userType="clinicDoctor" useAuth={useAuth} />
            </PrivateRoute>

            <PrivateRoute path="/write/review/:link">
              <Route userType="client" component={WriteReview} />
            </PrivateRoute>

            <PrivateRoute path="/write/recommendation/:link">
              <Route userType="doctor" component={WriteRecommendation} />
              <Route userType="clinicDoctor" component={WriteRecommendation} />
            </PrivateRoute>

            <Route exact path="/politics" component={Politics} />
            <Route exact path="/agreement" component={Agreement} />

            <Route component={NoMatch} />
        
          </Switch>
          <Footer />
        </ProvideAuth>
      </div>
      <ScrollToTop />
      </Suspense>
    </Router>
    
  );
}

export default App;