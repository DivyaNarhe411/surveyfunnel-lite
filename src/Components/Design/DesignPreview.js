import React, { useContext, useEffect, useState } from "react";
import { BuildContext } from "../Context/BuildContext";
import fetchData from "../../HelperComponents/fetchData";
import { DesignContext } from "../Context/DesignContext";
import { convertToRgbaCSS, designBackground } from "../../HelperComponents/HelperFunctions";

function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

const currentlyPreviewing = true;

let initialState = [];

export default function DesignPreview() {
    const { List } = useContext(BuildContext);
    const designCon = useContext(DesignContext);
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
    }, [List]);

    const changeCurrentTab = function (num) {
		// check for validations
		if ( ! checkValidations( num ) || currentTab + num >= tabCount ) {
			return;
		}
        setCurrentTab(currentTab + num);
    };

	const checkValidations = ( num, disablity = false ) => {
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
                        case 'ShortTextAnswer':
                        case 'LongTextAnswer':
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
            if ( ! disablity ) {
                setError(error);
            }
			return false;
		}
        if ( ! disablity ) {
            setError([]);
        }
		return true;
	}

    const renderContentElements = (item, display = "none", idx) => {
        let style = {
            display,
        };
        switch (item.componentName) {
            case "SingleChoice":
                return (
                    <div className="wpsf-tab-SingleChoice"
                        style={{ ...style }}
                        key={item.id}
                    >
                        <div className="tab-container">
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
                                            <div key={item.id + "_radio" + "_" + i} style={{ border: `1px solid ${convertToRgbaCSS(designCon.answerBorderColor)}` }} className="wpsf-tab-answer-container">
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
                                                    <div>
                                                        { parseInt(i)+1}
                                                    </div>
                                                    <p>
                                                        {ele.name}
                                                     </p>

                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "MultiChoice":
                return (
                    <div className="wpsf-tab-MultiChoice"
                    style={{ ...style }}
                    key={item.id}
                    >
                        <div
                            className="tab-container"
                            key={item.id}
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
                                            <div key={item.id + "_checkbox" + "_" + i} style={{ border: `1px solid ${convertToRgbaCSS(designCon.answerBorderColor)}` }} className="wpsf-tab-answer-container">
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
                                                    <div>
                                                        { parseInt(i)+1}
                                                    </div>
                                                    <p>
                                                        {ele.name}
                                                     </p>
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "CoverPage":
                return (
                    <div className="wpsf-tab-CoverPage"
                    style={{ ...style }}
                    key={item.id}
                    >
                        <div
                            className="tab-container"
                            key={item.id}

                        >
                            <div className="tab" tab-componentname={item.componentName}>
                                <h3 className="surveyTitle">{item.title}</h3>
                                <p className="surveyDescription">{item.description}</p>
                                <button type="button" className="surveyButton" style={{ background: convertToRgbaCSS(designCon.buttonColor), color: convertToRgbaCSS(designCon.buttonTextColor) }} onClick={() => {
                                    changeCurrentTab(1);
                                }}>
                                    {item.button}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case "ResultScreen":
                return (
                    <div className="wpsf-tab-ResultScreen"
                    style={{ ...style }}
                    key={item.id}
                    >
                        <div
                            className="tab-container"
                            key={item.id}
                        >
                            <div className="tab" tab-componentname={item.componentName}>
                                <h3 className="surveyTitle">{item.title}</h3>
                                <p className="surveyDescription">{item.description}</p>
                            </div>
                        </div>
                    </div>
                );
            case 'FormElements':
                return (
                    <div className="wpsf-tab-FormElements"
                    style={{ ...style }}
                    key={item.id}
                    >
                        <div
                            className="tab-container"
                            key={item.id}
                        >
                            <div className="tab" tab-componentname={item.componentName}>
                                <h3 className="surveyTitle">{item.title}</h3>
                                <p className="surveyDescription">{item.description}</p>
                                {item.List.map(function(ele, i) {
                                    switch( ele.componentName ) {
                                        case 'FirstName':
                                        case 'LastName':
                                        case 'ShortTextAnswer':
                                            return <div key={ele.id + '_' + i + 'key'}>
                                                <label>{ele.name}</label>
                                                <input type="text" id={ele.id + '_' + i} style={{ border: `1px solid ${convertToRgbaCSS(designCon.answerBorderColor)}` }} placeholder={ele.placeholder} required={ele.required} value={ele.value} onChange={handleChange} inputidx={i} listidx={idx} />
                                            </div>
                                        case 'Email':
                                            return <div key={ele.id + '_' + i + 'key'}>
                                                <label>{ele.name}</label>
                                                <input type="email" id={ele.id + '_' + i} style={{ border: `1px solid ${convertToRgbaCSS(designCon.answerBorderColor)}` }} placeholder={ele.placeholder} required={ele.required} value={ele.value} onChange={handleChange} inputidx={i} listidx={idx}/>
                                            </div>
                                        case 'LongTextAnswer':
                                            return <div key={ele.id + '_' + i + 'key'}>
                                                <label>{ele.name}</label>
                                                <textarea id={ele.id + '_' + i} style={{ border: `1px solid ${convertToRgbaCSS(designCon.answerBorderColor)}` }} required={ele.required} placeholder={ele.placeholder} value={ele.value} onChange={handleChange} inputidx={i} listidx={idx}></textarea>
                                            </div>
                                    }
                                })}
                                <button type="button" onClick={() => {changeCurrentTab(1)}}>{item.buttonLabel}</button>
                            </div>
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

    designBackground( designCon );

    const checkButtonDisability = ( buttonType ) => {
        switch( buttonType ) {
            case 'Previous':
                return currentTab === 0;

            case 'Next':
                return componentList[currentTab].componentName === 'FormElements' || ! checkValidations( 1, true );
        }
    }

    const checkButtonVisibility = ( buttonType ) => {
        switch( buttonType ) {
            case 'Previous':
                return (currentTab !== 0 && (componentList[currentTab].type !== 'RESULT_ELEMENTS' || componentList[currentTab].type !== 'START_ELEMENTS'))
            case 'Next':
                return (currentTab !== tabCount - 1 && (componentList[currentTab].type !== 'RESULT_ELEMENTS' || componentList[currentTab].type !== 'START_ELEMENTS'));
        }
    }
    
    return (
        <div className="wpsf-survey-form" style={{fontFamily: designCon.fontFamily}}>
            {tabCount === 0 ? (
                <div className="no-preview-available">
                    <img src={require(`../Build/BuildImages/unavailable.png`)}></img>
                    {currentlyPreviewing
                        ? "No Preview Available"
                        : "No Questions were added in this survey"}
                </div>
            ) : (
                <div className="wpsf-design-preview-container" style={{ ...designCon.backgroundStyle }}>
                    <div className="preview" style={{color: convertToRgbaCSS( designCon.fontColor ) }}>
                        <div className="main-tab-container">

                        <div className="tab-list" style={{background: convertToRgbaCSS( designCon.backgroundContainerColor )}}>
                            {componentList.map(function (item, i) {
                                if (currentTab === i) {
                                    switch(item.componentName){
                                        case 'CoverPage':
                                        case 'ResultScreen':
                                            return renderContentElements(item, "flex", i);
                                        case 'SingleChoice':
                                        case 'MultiChoice':
                                        case 'FormElements':
                                            return renderContentElements(item, "block", i);

                                    }
                                }
                                return renderContentElements(item, 'none', i);
                            })}
                        </div>
                        {error.length > 0 && <div className="tab-validation-error">
                            {error.map(function(err) {
                                return err;
                            })}	
                        </div>}
                    
                        {componentList[currentTab].type !== 'START_ELEMENTS' && <div className="tab-controls">
                            {checkButtonVisibility( 'Previous' ) && <button
                                type="button"
                                onClick={() => {
                                    changeCurrentTab(-1);
                                }}
                                disabled={checkButtonDisability('Previous')}
                            >
                                {currentTab === tabCount - 1 ? 'Enter New Submission?' : '<'}
                            </button>}
                            { checkButtonVisibility( 'Next' ) &&
                            <button
                                type="button"
                                onClick={() => {
                                    changeCurrentTab(1);
                                }}
                                disabled={checkButtonDisability('Next')}
                            >
                                &gt;
                            </button>}
                            <button onClick={() => {
                                setCurrentTab(0);
                            }}>Restart</button>

                        </div>}
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
