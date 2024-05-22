import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter as Router,
  Switch,
  Route,
  Redirect } from 'react-router-dom';
import API from "./utils/API";

import "./App.scss";

// components
import Auth from "./pages/Auth";
import Applications from "./pages/Applications";
import Checking from "./pages/Checking";
import Patients from "./pages/Patients";
import Blog from "./pages/Blog";
import Reviews from "./pages/Reviews";
import Settings from "./pages/Settings";
import EditDoctor from "./pages/EditDoctor";
import EditClinic from "./pages/EditClinic";
import EditPost from "./pages/EditPost";
import AddPost from "./pages/AddPost";
import NewSeller from "./pages/NewSeller";
import EditFarm from "./pages/EditFarm";
import EditArticle from "./pages/EditArticle";
import EditProduct from "./pages/EditProduct";
import EditBanner from "./pages/EditBanner";

import EditReviews from "./pages/EditReviews";


// GET USERS
let getAdminStatus = async () => {
    let res = await API.get('/admins');
    return await res.data;
}
// END OF GET USERS


const authContext = createContext();

function ProvideAuth({ children }) {
    let [isAdmin, setIsAdmin] = useState(null);

    useEffect(() => {
        getAdminStatus().then(res => {
            setIsAdmin(res.success);
        })
    }, [])


    let auth = {
      isAdmin: isAdmin,
        signin: (cb) => {
            getAdminStatus().then(res => {
              setIsAdmin(res.success);
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
            setIsAdmin(false);
        },
        reconfirm: (cb) => {
          getAdminStatus().then(res => {
                setIsAdmin(res.success);
                cb();
            })
        }
    }



    if(isAdmin !== null) return (
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

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  let auth = useAuth();
  console.log("auth.userId", rest.computedMatch);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        (auth.isAdmin) ? (
          React.cloneElement(children, { match: rest.computedMatch })
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

let App = () => {
  return (
    <Router>
    <div className="App">
      <ProvideAuth>
          <Switch>
        <Route exact path="/">
          <Auth useAuth={useAuth} />
        </Route>
        <PrivateRoute path="/applications">
          <Applications useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/checking">
          <Checking useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/sellers/new">
          <NewSeller useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/editfarm/:idSeller">
          <EditFarm useAuth={useAuth} />
        </PrivateRoute>
         <PrivateRoute path="/patients">
          <Patients useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/blog">
          <Blog useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/reviews">
          <Reviews useAuth={useAuth} />
        </PrivateRoute>

        <PrivateRoute path="/editreviews">
          <EditReviews useAuth={useAuth} />
        </PrivateRoute>

        <PrivateRoute path="/settings">
          <Settings useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/editdoctor/:idSeller">
          <EditDoctor useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/editclinic/:idSeller">
          <EditClinic useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/editpost/:idPost">
          <EditPost useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/editarticle/:idArticle">
          <EditArticle useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/editproduct/:idProduct">
          <EditProduct useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/editbanner/:idBanner">
          <EditBanner useAuth={useAuth} />
        </PrivateRoute>
        <PrivateRoute path="/addpost">
          <AddPost useAuth={useAuth} />
        </PrivateRoute>
      </Switch>
      </ProvideAuth>
    </div>
    </Router>
  );
}

export default App;
