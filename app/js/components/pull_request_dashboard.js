var React = require('react');
var PullRequest = require('./pull_request');
var LoginForm = require('./login_form');

var PullRequestDashboard = React.createClass({
  getInitialState: function() {
    return {
      loggedIn: this.props.loggedIn || false
    };
  },
  componentDidMount: function(){
   
  },
  refresh: function(){
    React.unmountComponentAtNode(this.getDOMNode().parentNode);
    setTimeout(function(){
      React.renderComponent(
        <PullRequestDashboard pullRequests={pullRequests} loggedIn={true} />,
        document.body
      );
    }, 0);
  },
  addPullRequest: function(){
    var matchData = this.refs.input.getDOMNode().value.match(/([^\/]*)\/([^#]*)#(.*)/);
    if (matchData === null){
      matchData = this.refs.input.getDOMNode().value.match(/.*github.com\/([^\/]*)\/([^\/]*)\/pull\/([0-9]*)/);
    }
    var pullRequest = {owner: matchData[1], repo: matchData[2], id: matchData[3]};
    this.props.pullRequests.push(pullRequest);
    var data = JSON.parse(localStorage.getItem('pullRequestDashboard'));
    data.pullRequests = this.props.pullRequests;
    localStorage.setItem('pullRequestDashboard', JSON.stringify(data));
    this.setProps({pullRequest: this.props.pullRequest});
    this.refs.input.getDOMNode().value = '';
  },
  handleKeyEvent: function(event){
    if (event.which === 13) {
      this.addPullRequest();
    }
  },
  login: function(credentials){
    var hash = btoa(credentials.username + ':' + credentials.password);
    $.ajaxSetup({
      beforeSend: function (xhr) {
        xhr.setRequestHeader ('Authorization', 'Basic '+ hash);
      }
    });
    this.setState({loggedIn: true});
  },
  removePullRequest: function(id){
    var list = _.reject(this.props.pullRequests, function(p){
      return p.id === id;
    });
    var data = JSON.parse(localStorage.getItem('pullRequestDashboard'));
    data.pullRequests = lists;
    localStorage.setItem('pullRequestDashboard', JSON.stringify(data));
    this.setProps({pullRequests: list});
  },
  render: function(){
    if (!this.state.loggedIn) {
      return (<LoginForm login={this.login} />);
    }
    var pullRequestNodes = [];
    var self = this;
    if (this.props.pullRequests.length === 0){
      pullRequestNodes.push(
        <div>You don't have any saved pull requests. Please add using the input above</div>
      );
    }
    this.props.pullRequests.forEach(function(p){
      pullRequestNodes.push(
        <PullRequest key={p.id} id={p.id} repo={p.repo} owner={p.owner} removePullRequest={self.removePullRequest} token={self.props.token} />
      );
    });
    return (
      <div>
        <h1 className="text-center">Pull Request Dashboard</h1>
        <input type="text" className="form-control enter-pr" placeholder="Paste pull request URL or enter owner/repo#id" ref="input" onKeyPress={this.handleKeyEvent} />
        <div className="button-container text-center"><button type="button" className="btn btn-primary" onClick={this.refresh}>Refresh</button></div>
        <div id="container">
          <ul>
            {pullRequestNodes}
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = PullRequestDashboard;
