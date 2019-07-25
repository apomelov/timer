import "bootstrap"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/css/bootstrap-theme.min.css"

import "../styles/main.css"

import { render }                                from "react-dom"
import { Provider }                              from "react-redux"
import { Helmet }                                from "react-helmet"
import { createStore, applyMiddleware }          from "redux"
import createSagaMiddleware                      from "redux-saga"
import { rootReducer, rootSaga }                 from "./modules/index"

import App                                       from "./containers/App"

require("babel-core/register");
require("babel-polyfill");

function initStore() {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        rootReducer,
        applyMiddleware(sagaMiddleware)
    );
    sagaMiddleware.run(rootSaga);

    window.store = store;

    return store;
}

render(
    <Provider store={initStore()}>
        <div className="app">
            <Helmet>
                <meta charSet="UTF-8" />
                <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
                <title>Timer</title>
            </Helmet>
            <App />
        </div>
    </Provider>,
    document.getElementById("root")
);
