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

var pullRequests = JSON.parse(localStorage.getItem('pullRequestDashboard')) || [];

var PullRequest = React.createClass({
  getInitialState: function() {
    return {
      body: '',
      mergeable: true,
      merged: false,
      title: '',
      label: '',
      avatar: '',
      statuses: []
    };
  },
  componentWillMount: function(){
    var url = 'https://api.github.com/repos/'+this.props.owner+'/'+this.props.repo+'/pulls/'+this.props.id;
    $.get(url, this.success);
  },
  success: function(data){
    this.setState({
      body: data.body,
      mergeable: data.mergeable,
      merged: data.merged,
      title: data.title,
      label: data.head.label,
      avatar: data.user.avatar_url
    });
    var self = this;
    var statusUrl = data.statuses_url;
    statusUrl = statusUrl.replace('statuses', 'status');
    $.get(statusUrl, function(data){
      var statuses = [];
      data.statuses.forEach(function(s){
        statuses.push({description: s.description, targetUrl: s.target_url, state: s.state, id: s.id});
      });
      self.setState({
        statuses: statuses
      });
    });
  },
  handleClick: function(){
    this.props.removePullRequest(this.props.id);
  },
  parseBody: function(){
    var string = this.state.body.replace(/\[#(.*)\]/, function(str, number){
      return '<a href="https://www.pivotaltracker.com/story/show/'+number+'">[#'+number+']</a>';
    });
    return string;
  },
  render: function(){
    var mergeableClass, mergeableIconClass;
    if (this.state.merged) {
      mergeableClass = 'merged';
      mergeableIconClass = 'octicon-git-pull-request';
    }
    else if (this.state.mergeable){
      mergeableClass = 'mergeable';
      mergeableIconClass = 'octicon-git-merge';
    } else {
      mergeableClass = 'unmergeable';
      mergeableIconClass = 'octicon-git-pull-request';
    }
    var statusesNodes = [];
    this.state.statuses.forEach(function(s){
      statusesNodes.push(<div key={s.id}>{s.description} (<a href={s.targetUrl}>Details</a>)</div>);
    });
    return (
      <li>
        <div className="pull-request-item">
          <div className="remove" onClick={this.handleClick}>
            ✖
          </div>
          <div className="status">
            <div className={mergeableClass}>
              <span className={"mega-octicon "+mergeableIconClass}></span>
            </div>
          </div>
          <div className="avatar">
            <img src={this.state.avatar} height="48px" width="48px"/>
          </div>
          <div className="header">
            <span className="title">#{this.props.id}: {this.state.title}</span>
            <span className="branch-container"><span className="branch">{this.state.label}</span></span>
          </div>
          <div className="description">
             <div dangerouslySetInnerHTML={{__html: this.parseBody()}} />
          </div>
          <div className="build-status">
             {statusesNodes}
          </div>
          <div className="clear"></div>
        </div>
      </li>
    );
  }
});

var LogInForm = React.createClass({
  handleSubmit: function(e){
    var credentials = $(e.target).serializeObject();
    this.props.login(credentials);
    e.preventDefault();
  },
  render: function(){
    return (
    <div>
      <h1 className="text-center">Pull Request Dashboard</h1>
      <div id="container">
        <h2 className="text-center">Log in with Github credentials</h2>
        <form className="login" role="form" onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input name="username" type="text" className="form-control" id="username" placeholder="Enter Username" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input name="password" type="password" className="form-control" id="password" placeholder="Password" />
          </div>

          <button type="submit" className="btn btn-default">Submit</button>
        </form>
      </div>
    </div>
    );
  }
});

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
      matchData = this.refs.input.getDOMNode().value.match(/.*github.com\/([^\/]*)\/([^\/]*)\/pull\/(.*)/);
    }
    var pullRequest = {owner: matchData[1], repo: matchData[2], id: matchData[3]};
    this.props.pullRequests.push(pullRequest);
    localStorage.setItem('pullRequestDashboard', JSON.stringify(this.props.pullRequests));
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
    localStorage.setItem('pullRequestDashboard', JSON.stringify(list));
    this.setProps({pullRequests: list});
  },
  render: function(){
    if (!this.state.loggedIn) {
      return (<LogInForm login={this.login} />);
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
        <PullRequest key={p.id} id={p.id} repo={p.repo} owner={p.owner} removePullRequest={self.removePullRequest} />
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

React.renderComponent(
  <PullRequestDashboard pullRequests={pullRequests} />,
  document.body
);