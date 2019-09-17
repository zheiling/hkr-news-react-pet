import React, { Component } from "react";
import "./App.css";
import PropTypes from 'prop-types';
import axios from 'axios';
// import UIkit from 'uikit';
// import Icons from 'uikit/dist/js/uikit-icons';

const DEFAULT_QUERY = 'redux',
      DEFAULT_HPP = '20',

      PATH_BASE = 'https://hn.algolia.com/api/v1',
      PATH_SEARCH = '/search',
      PARAM_SEARCH = 'query=',
      PARAM_PAGE = 'page=',
      PARAM_HPP = 'hitsPerPage=';

class App extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);

  }

  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    const oldHits = results && results[searchKey] 
            ? results[searchKey]['hits']
            : [];
    const updatedHits = [
              ...oldHits,
              ...hits
          ];

    if (this._isMounted) {
      this.setState({ 
        results: 
        { 
          ...results,
          [searchKey]: { hits: updatedHits, page } 
        },
        isLoading: false,
      });
    }

  }

  fetchSearchTopStories (searchTerm, page = 0) {

    this.setState({ isLoading: true });

    axios.get(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(result => this.setSearchTopStories(result.data))
    .catch(error => this.setState({ error }));
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({ 
      results : {
        ...results,
        [searchKey] : { hits: updatedHits, page }
      }
     });
   }

   onSearchChange(event) {
     this.setState({ searchTerm : event.target.value })
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  render() {
    const { 
            searchTerm, 
            results,
            searchKey,
            error,
            isLoading
    } = this.state;

    const page = (
      results && 
      results[searchKey] &&
      results['page']
    ) || 0;

    const list = (
      results &&
      results[searchKey] &&
      results[searchKey]['hits']
    ) || [];
    
    return (
      <div className="App uk-background-muted">
        <div className="uk-container uk-background-default">
          <h1 className="uk-heading-small uk-text-center">Hacker News</h1>
          <div className="control-panel">
            <Search 
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
              placeholder="Поиск..."
              isLoading={isLoading}
            >
            </Search>
          </div>
           { error
              ? <Alert className="uk-alert-danger">
                Something has gone wrong...
              </Alert>
              : results && results[searchKey] && results[searchKey]['hits'].length > 0
                  ? <Table 
                    list={list}
                    onDismiss={this.onDismiss}
                  />
                  : <Alert className="uk-text-center">
                      There is no info to display.
                    </Alert>
          }
          <div className="interactions">
            {
              isLoading
              ? <Loading />
              : <Button 
              className="uk-margin-bottom uk-width-1-1" 
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)} 
              >
                More
              </Button>
              
            }
          </div>
        </div>
      </div>
    );
  }
}

const Button = ({ 
  onClick, 
  className,
  children,
}) => (
    <button onClick={onClick} className={className} type="button">
      {children}
    </button>
);

Button.defaultProps = {
  className : 'uk-button',
}

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};


class Search extends Component {

  componentDidMount () {
    if (this.input) {
      this.input.focus();
    }
  }

  render () {
    const {
      value,
      onChange,
      children,
      placeholder,
      onSubmit,
      isLoading
    } = this.props;

    return (

      <form className="uk-search uk-search-large" onSubmit={onSubmit}>
          { isLoading
            ? <button type="submit"><span uk-icon="icon: clock; ratio: 2"></span></button>
            : <button type="submit" uk-search-icon=""></button>
          }
          <input
            type="search"
            className="uk-search-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            ref={el => this.input = el}
          />
      {children}
      </form>     
    );  
  }
}

Search.defaultProps = {
  value: '',
  placeholder: "Search...",
}

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node,
  placeholder: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
}

const Table = ({list, onDismiss}) => (
      <table className="uk-table uk-table-hover uk-table-divider">
        <thead>
            <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Number of Comments</th>
                <th>Points</th>
                <th>Created date</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        { list.map(item =>
          <tr key={item.objectID}>
            <td>
              <a href={item.url}>{item.title}</a>
            </td>
            <td>{item.author}</td>
            <td>{item.num_comments}</td>
            <td>{item.points}</td>
            <td>{item.created_at}</td>
            <td>
              <Button
                onClick={() => onDismiss(item.objectID)}
              >
                Dismiss
              </Button>
            </td>
          </tr>
        )}
        </tbody>
      </table>
);

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
    ).isRequired,
    onDismiss: PropTypes.func.isRequired,
};

const Alert = ({children, className=""}) => (
  <div 
    uk-alert="" 
    className={`${className} uk-alert`}
  >
    { children }
  </div>
);

const Loading = () =>
 <div>Loading ...</div>

export default App;

export {
  Button,
  Search,
  Table,
};
