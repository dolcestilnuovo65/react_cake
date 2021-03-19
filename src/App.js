import React, { Component } from 'react';

import './App.css';
import VideoList from './components/movie_list';
import NavBar from './components/navbar'
import TRY  from './lib/backbone.ts';
const APIKEY = '4cb9def9';
const APIURL = 'http://www.omdbapi.com';

function fetchMovies(search = '') {

  return fetch(APIURL + '?apikey=' + APIKEY +'&s='+ search).then( res => res.json());
    
};
class App extends Component {
  t;
  constructor(props){
    super(props);
    this.t = TRY;
    this.state = {
       movies :  [],
       totalCount: 0
    }
    
  }
  searchMovies = (term = '') =>{
     if(term.length< 3){
       return
     }
     fetchMovies(term).then(res => {
      this.setState({
        movies : res.Search,
        totalCount : res.totalResults
      })
    })

  }
  componentDidMount(){
    this.searchMovies('back to the future')
  }
  render() {
    return (
      <React.Fragment>
      <NavBar onSearchTerm = {this.searchMovies} />
      <div className="container">
       <h1>My favorite movies{this.t} </h1>
       <VideoList movies={this.state.movies} />
      </div>
      </React.Fragment>
    );
  }
}

export default App;
