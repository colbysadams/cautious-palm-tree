import { createBrowserHistory } from 'history';
const history = createBrowserHistory();

let prevPath = null;

history.listen(location => {
  if (location.pathname !== prevPath) {
    prevPath = location.pathname;
    window.analytics.page();
  }
});

export default history;
