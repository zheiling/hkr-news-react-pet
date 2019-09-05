import React, { Component } from "react";
import "./App.css";
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
  constructor(props) {
    super(props);

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);

  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);
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

    this.setState({ 
      results: 
      { 
        ...results,
        [searchKey]: { hits: updatedHits, page } 
      }
     });
  }

  fetchSearchTopStories (searchTerm, page = 0) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response => response.json())
    .then(result => this.setSearchTopStories(result))
    .catch(error => error);
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
            searchKey
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
      <div className="App">
        <div className="uk-container">
          <h1 className="uk-heading-small uk-text-center">Hacker News</h1>
          <div className="control-panel">
            <Search 
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
              placeholder="Поиск..."
            >
            </Search>
          </div>
            { results && results[searchKey] && results[searchKey]['hits'].length > 0
              ? <Table 
                list={list}
                onDismiss={this.onDismiss}
              />
              : <Alert>
                  There is no info to display.
                </Alert>
            }
          <div className="interactions">
            <Button 
              className="uk-margin-bottom uk-button-primary" 
              onClick={() => this.fetchSearchTopStories(searchKey, page + 1)} 
            >
              More
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const Button = ({ onClick, className ='', children}) => (
    <button onClick={onClick} className={className} type="button">
      {children}
    </button>
);

const Search = ({ 
  value,
  onChange,
  children,
  placeholder,
  onSubmit
}) => (
    <form className="uk-search uk-search-large" onSubmit={onSubmit}>
        <button type="submit" uk-search-icon=""></button>
        <input
          type="search"
          className="uk-search-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
    {children}
    </form>       

  );

const Table = ({list, onDismiss}) => (
      <table class="uk-table uk-table-hover uk-table-divider">
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

const Alert = ({children}) => (
  <div uk-alert=""className="uk-text-center">{ children }</div>
);

export default App;
