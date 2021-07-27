import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import 'regenerator-runtime/runtime'
import Frame from 'react-frame-component';
import fetchData from "./HelperComponents/fetchData";

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

const currentlyPreviewing = false;

let initialState = [];

function Survey() {
    
    let build = JSON.parse(data.build);
    const { List } = build;
    const [currentTab, setCurrentTab] = useState(0);
    const [tabCount, setTabCount] = useState(0);
    const [componentList, setComponentList] = useState([]);
	const [error, setError] = useState([]);

    useEffect(() => {
        setComponentList([
            ...List.START_ELEMENTS,
            ...List.CONTENT_ELEMENTS,
            ...List.RESULT_ELEMENTS,
        ]);
        setTabCount(
            List.START_ELEMENTS.length +
			List.CONTENT_ELEMENTS.length +
			List.RESULT_ELEMENTS.length
        );
        initialState = [
            ...List.START_ELEMENTS,
            ...List.CONTENT_ELEMENTS,
            ...List.RESULT_ELEMENTS,
        ];
    }, []);

    const changeCurrentTab = function (num) {
		// check for validations
		if ( ! checkValidations( num ) ) {
			return;
		}
        if ( ! currentlyPreviewing && currentTab === tabCount - 2 && num !== -1 ) {
            
            let formData = {
                List: JSON.stringify(componentList),
                time: new Date(),
                security: data.ajaxSecurity,
                post_id: data.post_id,
                action: 'wpsf_new_survey_lead'
            }
            fetchData(data.ajaxURL, formData)
            .then((data) => {
                
            });
        }
		if ( currentTab === tabCount - 1 ) {

            setComponentList(initialState);
			setCurrentTab(0);
		}
		else {
			setCurrentTab(currentTab + num);
		}   
    };

	const checkValidations = ( num ) => {
		if ( currentlyPreviewing ) {
			return true;
		}

        if ( num === -1 ) {
            return true;
        }
        
		let error = [];
		switch ( componentList[currentTab].componentName ) {
			case 'CoverPage':
			case 'ResultScreen':
				break;
			case 'FormElements':
				let List = componentList[currentTab].List;
				List.map(function(item, i) {
					switch( item.componentName ) {
						case 'FirstName':
						case 'LastName':
							if( item.required ) {
                                // do validation.
                                if ( item.value === '' ) {
                                    error.push(<p key={error.length}>{item.name} cannot be empty</p>)
                                }
                            }
							break;
                        case 'Email':
                            if (item.required) {
                                if ( item.value === '' ) {
                                    error.push(<p key={error.length}>{item.name} cannot be empty</p>)
                                }
                                else if ( ! validateEmail(item.value) ) {
                                    error.push(<p key={error.length}>Not a valid email!</p>)
                                }
                            }
                            break;
					}
				})
                break;
            case 'MultiChoice':
                const {answers} = componentList[currentTab];
                let flag = false;
                for(let i = 0; i < answers.length ; i++) {
                    if ( answers[i].checked ) {
                        flag = true;
                        break;
                    }
                }
                if ( ! flag ) {
                    error.push( <p key={error.length}>Please select atleast one answer!</p> );
                }
                break;
            case 'SingleChoice':
                if ( componentList[currentTab].value === '' ) {
                    error.push( <p key={error.length}>Please select atleast one answer!</p> );
                }
                break;
		}
		if ( error.length > 0 ) {
			setError(error);
			return false;
		}
		setError([]);
		return true;
	}

    const renderContentElements = (item, display = "none", idx) => {
        let style = {
            display,
        };
        switch (item.componentName) {
            case "SingleChoice":
                return (
                    <div
                        className="tab-container"
                        key={item.id}
                        style={{ ...style }}
                    >
                        <div
                            className="tab"
                            key={item.id}
                            tab-componentname={item.componentName}
                        >
                            <h3 className="surveyTitle">{item.title}</h3>
                            <p className="surveyDescription">{item.description}</p>
    
                            <div className="radio-group">
                                {item.answers.map(function (ele, i) {
                                    return (
                                        <div key={item.id + "_radio" + "_" + i}>
                                            <input
                                                type="radio"
                                                name={item.id + "_radio"}
                                                id={item.id + "_radio" + "_" + i}
                                                value={ele.name}
                                                onChange={handleRadioChange}
                                                listidx={idx}
                                                inputidx={i}
                                                checked={item.value === ele.name}
                                            />
                                            <label
                                                htmlFor={
                                                    item.id + "_radio" + "_" + i
                                                }
                                            >
                                                {ele.name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            case "MultiChoice":
                return (
                    <div
                        className="tab-container"
                        key={item.id}
                        style={{ ...style }}
                    >
                        <div
                            className="tab"
                            key={item.id}
                            tab-componentname={item.componentName}
                        >
                            <h3 className="surveyTitle">{item.title}</h3>
                            <p className="surveyDescription">{item.description}</p>
    
                            <div className="checkbox-group">
                                {item.answers.map(function (ele, i) {
                                    return (
                                        <div key={item.id + "_checkbox" + "_" + i}>
                                            <input
                                                type="checkbox"
                                                name={item.id + "_checkbox"}
                                                id={item.id + "_checkbox" + "_" + i}
                                                value={ele.name}
                                                listidx={idx}
                                                inputidx={i}
                                                checked={ele.checked}
                                                onChange={handleCheckboxChange}
                                            />
                                            <label
                                                htmlFor={
                                                    item.id + "_checkbox" + "_" + i
                                                }
                                            >
                                                {ele.name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            case "CoverPage":
                return (
                    <div
                        className="tab-container"
                        key={item.id}
                        style={{ ...style }}
                    >
                        <div className="tab" tab-componentname={item.componentName}>
                            <h3 className="surveyTitle">{item.title}</h3>
                            <p className="surveyDescription">{item.description}</p>
                            <button type="button" className="surveyButton" onClick={() => {}}>
                                {item.button}
                            </button>
                        </div>
                    </div>
                );
            case "ResultScreen":
                return (
                    <div
                        className="tab-container"
                        key={item.id}
                        style={{ ...style }}
                    >
                        <div className="tab" tab-componentname={item.componentName}>
                            <h3 className="surveyTitle">{item.title}</h3>
                            <p className="surveyDescription">{item.description}</p>
                        </div>
                    </div>
                );
            case 'FormElements':
                return (
                    <div
                        className="tab-container"
                        key={item.id}
                        style={{ ...style }}
                    >
                        <div className="tab" tab-componentname={item.componentName}>
                            <h3 className="surveyTitle">{item.title}</h3>
                            <p className="surveyDescription">{item.description}</p>
                            {item.List.map(function(ele, i) {
                                switch( ele.componentName ) {
                                    case 'FirstName':
                                    case 'LastName':
                                        return <div key={ele.id + '_' + i + 'key'}>
                                            <label>{ele.name}</label>
                                            <input type="text" id={ele.id + '_' + i} required={ele.required} value={ele.value} onChange={handleChange} inputidx={i} listidx={idx} />
                                        </div>
                                    case 'Email':
                                        return <div key={ele.id + '_' + i + 'key'}>
                                            <label>{ele.name}</label>
                                            <input type="email" id={ele.id + '_' + i} required={ele.required} value={ele.value} onChange={handleChange} inputidx={i} listidx={idx}/>
                                        </div>
                                }
                            })}
                        </div>
                    </div>
                )
            default:
                return "";
        }
    };

    const handleChange = (e) => {
        let inputidx = e.target.getAttribute('inputidx');
        let listidx = e.target.getAttribute('listidx');
        let newList = JSON.parse(JSON.stringify(componentList));
        newList[listidx].List[inputidx].value = e.target.value;
        setComponentList(newList);
    }

    const handleCheckboxChange = (e) => {
        let inputidx = e.target.getAttribute('inputidx');
        let listidx = e.target.getAttribute('listidx');
        let newList = JSON.parse(JSON.stringify(componentList));
        newList[listidx].answers[inputidx].checked = !newList[listidx].answers[inputidx].checked;
        setComponentList(newList);
    }

    const handleRadioChange = (e) => {
        let listidx = e.target.getAttribute('listidx');
        let newList = JSON.parse(JSON.stringify(componentList));
        newList[listidx].value = e.target.value;
        setComponentList(newList);
    }

    return (
        <Frame width="100%" height="100%">
        <form className="wpsf-survey-form">
            {tabCount === 0 ? (
                <div className="no-preview-available">
                    {currentlyPreviewing
                        ? "No Preview Available"
                        : "No Questions were added in this survey"}
                </div>
            ) : (
                <div className="preview">
                    <div className="tab-list">
                        {componentList.map(function (item, i) {
                            if (currentTab === i) {
                                return renderContentElements(item, "block", i);
                            }
                            return renderContentElements(item, 'none', i);
                        })}
                    </div>
					{error.length > 0 && <div className="tab-validation-error">
						{error.map(function(err) {
							return err;
						})}	
					</div>}
                    <div className="tab-controls">
						{currentTab !== tabCount - 1 &&
						<button
                            type="button"
                            onClick={() => {
                                changeCurrentTab(1);
                            }}
                        >
                            Next
                        </button>}
                        {currentTab !== 0 && <button
                            type="button"
                            onClick={() => {
                                changeCurrentTab(-1);
                            }}
                        >
                            {currentTab === tabCount - 1 ? 'Enter New Submission?' : 'Previous'}
                        </button>}
                    </div>
                </div>
            )}
        </form>
        </Frame>
    );
}
let id = 'wpsf-survey-' + data.time;
ReactDOM.render(<Survey /> , document.getElementById( id ));