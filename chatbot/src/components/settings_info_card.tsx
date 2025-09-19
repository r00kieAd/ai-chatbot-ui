import React from 'react';
import LLMCONFIGINFO from '../configs/lllm_config_info.json';

const SettingInfoCard: React.FC = () => {
    return (
        <>
            <div id="settingsInfoParentDiv">
                <div id="settingInfoChildDiv">
                    <div className="settings-info-header">
                        <h3 className="poppins-regular">LLM Configuration Parameters</h3>
                        <p className="montserrat-msg">Adjust these parameters to control AI response behavior</p>
                    </div>
                    
                    <div className="info-grid">
                        {LLMCONFIGINFO.parameters.map((param, index) => (
                            <div key={param.name} className={`info-div info-div-${index + 1}`}>
                                <div className="param-header">
                                    <span className="param-name info-prop poppins-regular">{param.name}</span>
                                </div>
                                
                                <div className="param-details">
                                    <div className="param-row">
                                        <span className="label">Description:</span>
                                        <span className="description info-prop montserrat-msg">{param.description}</span>
                                    </div>
                                    
                                    <div className="param-row">
                                        <span className="label">Range:</span>
                                        <span className="range info-prop">{param.range}</span>
                                    </div>
                                    
                                    <div className="param-row">
                                        <span className="label">Default:</span>
                                        <span className="default-value info-prop">{param.default}</span>
                                    </div>
                                    
                                    <div className="param-row">
                                        <span className="label">Example:</span>
                                        <span className="example info-prop">{param.example}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default SettingInfoCard;