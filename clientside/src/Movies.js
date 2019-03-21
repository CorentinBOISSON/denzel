import React, { Component } from 'react';
import logo from './denzel.jpg';
import './App.css';



class Movie extends Component {



    constructor(props) {

        super(props);

        this.state = {

            item: [],

            isLoaded: false,

        }

    }

    componentDidMount() {

        fetch('http://localhost:9292/movies')

            .then(res => res.json())

            .then(json => {

                    this.setState({

                        isLoaded: true,

                        item: json,

                    })

                }



            )



    }

    render() {

        var { isLoaded, item } = this.state



        if (!isLoaded) {

            return (

                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <p>
                            The must-watch Denzel's movies:


                            <div>
                                ERROR
                            </div>


                        </p>

                    </header>
                </div>
            )

        }

        else {

            return (



                <div className="App">
                    <header className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <p>
                            The must-watch Denzel's movies:


                            <div>

                                {item.map(it => (<div>

                                        Title : {it.title}

                                    </div>

                                ))}

                            </div>

                        </p>

                    </header>
                </div>



            );

        }

    }

}



export default Movie;