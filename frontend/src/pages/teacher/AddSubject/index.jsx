import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import backend from '../../../api/backend';

import style from './css/addsubject.module.css';

function AddSubject() {
    const { courseId } = useParams();
    const [ imageFiles, setImageFiles ] = useState([]);
    const [ previewImages, setPreviewImages ] = useState([]);
    const [ subjectInput, setSubjectInput ] = useState({
        name: "",
        content: {
            title: "",
            description: "",
        },
        subcontent: [],
        summary: ""
    });
    const [ questionInout, setQuestionInput ] = useState([]);

    const addSubcontent = () => {
        setSubjectInput({
            ...subjectInput,
            subcontent: [
                ...subjectInput.subcontent,
                {
                    title: "",
                    description: ""
                }
            ]
        });
    };
    
    const handleSubcontentChange = (e, index) => {
        const { name, value } = e.target;
        const updatedSubcontent = [...subjectInput.subcontent];
        updatedSubcontent[index][name] = value;
        setSubjectInput({
            ...subjectInput,
            subcontent: updatedSubcontent
        });
    };

    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setImageFiles([...imageFiles, ...fileArray]);

            const previewURLs = fileArray.map(file => URL.createObjectURL(file));
            setPreviewImages([...previewImages, ...previewURLs]);
        }
    };

    const removeImage = (index) => {
        const updatedImages = [...imageFiles];
        const updatedPreviews = [...previewImages];
        updatedImages.splice(index, 1);
        updatedPreviews.splice(index, 1);
        setImageFiles(updatedImages);
        setPreviewImages(updatedPreviews);
    };

    const saveSubjectData = async () => {
        const formData = new FormData();

        const { name, content, subcontent, summary } = subjectInput;
        const jsonData = { content, subcontent, summary };

        formData.append("name", name);
        formData.append("data", JSON.stringify(jsonData));
      
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      
        try {
          const response = await backend.post(`/teacher/saveSubject/${courseId}`,
            formData, {
              headers: {
                "Content-Type": "multipart/form-data"
              },
            }
          );
      
          console.log("Response:", response.data);
        } catch (error) {
          console.error("Error saving subject data:", error);
        }
    };

    return (
        <div className={style["add-subject-container"]}>
            <div className={style.container}>
                <div className={style.title}>
                    <h1>Add Subject</h1>
                </div>
    
                <div className={style["input-container"]}>
                    <div className={style.header}>
                        <p>Subject Name</p>
                        <input
                            type='text'
                            placeholder='Subject Name'
                            required
                            value={subjectInput.name}
                            onChange={(e) => setSubjectInput({ ...subjectInput, name: e.target.value })}
                        />
                    </div>

                    <div className={style["input-images"]}>
                        <h3>Upload Images</h3>
                        <input
                            type="file"
                            multiple
                            onChange={handleImageUpload}
                        />
                        <div className={style["image-preview"]}>
                            {previewImages.map((preview, index) => (
                                <div key={index} className={style["image-item"]}>
                                    <img src={preview} alt={`Preview ${index}`} className={style["preview-image"]} />
                                    <button onClick={() => removeImage(index)}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>
    
                    <div className={style.body}>
                        <h3>Content</h3>
                        <div className={style["main-content"]}>
                            <div>
                                <label>Title</label>
                                <input
                                    type='text'
                                    placeholder='Title'
                                    required
                                    value={subjectInput.content.title}
                                    onChange={(e) => setSubjectInput({
                                        ...subjectInput,
                                        content: {
                                            ...subjectInput.content,
                                            title: e.target.value
                                        }
                                    })}
                                />
                            </div>
    
                            <div>
                                <label>Description</label>
                                <textarea
                                    rows='4'
                                    cols='50'
                                    placeholder='Description'
                                    required
                                    value={subjectInput.content.description}
                                    onChange={(e) => setSubjectInput({
                                        ...subjectInput,
                                        content: {
                                            ...subjectInput.content,
                                            description: e.target.value
                                        }
                                    })}
                                />
                            </div>
                        </div>
    
                        <h3>Subcontent</h3>
                        {subjectInput.subcontent.map((sub, index) => (
                            <div className={style["sub-content"]} key={index}>
                                <div>
                                    <label>Title</label>
                                    <input
                                        type='text'
                                        placeholder='Title'
                                        required
                                        value={sub.title}
                                        onChange={(e) => handleSubcontentChange(e, index)}
                                        name="title"
                                    />
                                </div>
    
                                <div>
                                    <label>Description</label>
                                    <textarea
                                        rows='4'
                                        cols='50'
                                        placeholder='Description'
                                        required
                                        value={sub.description}
                                        onChange={(e) => handleSubcontentChange(e, index)}
                                        name="description"
                                    />
                                </div>
                            </div>
                        ))}

                        <button className={style["add-subcontent-button"]} onClick={addSubcontent}>
                            Add Subcontent
                        </button>

                        <div className={style["summary-container"]}>
                            <h3>Summary</h3>
                            <div>
                                <textarea
                                    rows='4'
                                    cols='50'
                                    placeholder='Summary'
                                    required
                                    value={subjectInput.summary}
                                    onChange={(e) => setSubjectInput({
                                        ...subjectInput,
                                        summary: e.target.value
                                    })}
                                />
                            </div>
                        </div>
 
                    </div>
                </div>
    
                <div className={style["button-container"]}>
                    <button onClick={saveSubjectData}>Save</button>
                </div>
            </div>
        </div>
    );
}

export default AddSubject