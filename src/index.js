import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import { GunProvider } from 'react-gun';
import Gun from "gun/gun";


import App from './components/App';
import Layout from './components/Layout';
import Info from './components/Pages/Info';
import Register from './components/Pages/Register';
import UserProducts from './components/Pages/UserProducts';
import EditProduct from './components/Pages/UserProducts/EditProduct';
import ProductDetails from './components/Pages/ProductDetails';
import Contribute from './components/Pages/Contribute';
import Address from './components/Pages/Address';

ReactDOM.render(
    <BrowserRouter>
      <GunProvider gun={Gun()}>
        <Layout>
          <Switch>
            <Route exact path="/" component={App} />
            <Route path="/info" component={Info} />
            <Route path="/register" component={Register} />
            <Route path="/contribute" component={Contribute} />
            <Route path="/address" component={Address} />
            <Route path="/userProducts" component={UserProducts} />
            <Route path="/EditProduct/:id" component={EditProduct} />
            <Route path="/productDetails/:id" component={ProductDetails} />
          </Switch>
        </Layout>
      </GunProvider>
    </BrowserRouter>

, document.getElementById('root'));
registerServiceWorker();