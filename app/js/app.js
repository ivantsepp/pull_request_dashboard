var React = require('react');
var PullRequestDashboard = require('./components/pull_request_dashboard');

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function randomNumber(){
  return Math.floor((Math.random() * 1000000) + 1);
}
// https://gist.github.com/ryoppy/5780748
function getQueryParams(queryString) {
  var query = (queryString || window.location.search).substring(1); // delete ?
  if (!query) {
    return false;
  }
  return _
  .chain(query.split('&'))
  .map(function(params) {
    var p = params.split('=');
    return [p[0], decodeURIComponent(p[1])];
  })
  .object()
  .value();
}

var data = JSON.parse(localStorage.getItem('pullRequestDashboard')) || {};
if(!data.pullRequests){
  data.pullRequests = [];
  localStorage.setItem('pullRequestDashboard', JSON.stringify(data));
}
var pullRequests = data.pullRequests;
if (!data.randomState){
  data.randomState = randomNumber();
  localStorage.setItem('pullRequestDashboard', JSON.stringify(data));
}

var pullRequestDashboard = React.render(
  <PullRequestDashboard pullRequests={pullRequests} token={data.token} loggedIn={!!data.token} />,
  document.body
);
if (!data.token){
  var params = getQueryParams();
  if (params) {
    if (parseInt(params.state, 10) === data.randomState){
      $.getJSON('https://morning-earth-4943.herokuapp.com/authenticate/'+params.code, function(response) {
        console.log(response.token);
        data.token = response.token;
        localStorage.setItem('pullRequestDashboard', JSON.stringify(data));
        pullRequestDashboard.setProps({token: data.token});
        pullRequestDashboard.setState({loggedIn: true});
      });
    }
  }
}
window.React = React;
