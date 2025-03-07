import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";

import style from "./css/addsubject.module.css";

function AddSubject() {
    const { courseId } = useParams();
    const [imageFiles, setImageFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [subjectInput, setSubjectInput] = useState({
        name: null,
        content: {
        title: null,
        description: null,
        },
        subcontent: [],
        summary: null,
    });
    const [questionType, setQuestionType] = useState([]);
    const [questionInput, setQuestionInput] = useState([]);
    const [answerType, setAnswerType] = useState([]);
    const navigate = useNavigate();

    const fetchQuestionType = async () => {
        try {
        const response = await backend.get("/question/getAlltype");

        if (response.status === 200) {
            setQuestionType(response.data.questionType);
            setAnswerType(response.data.answerType);
        }
        } catch (error) {
        console.log(error);
        }
    };

    useEffect(() => {
        fetchQuestionType();
    }, []);

    const addSubcontent = () => {
        setSubjectInput({
            ...subjectInput,
            subcontent: [
                ...subjectInput.subcontent,
                {
                title: "",
                description: "",
                },
            ],
        });
    };

    const handleSubcontentChange = (e, index) => {
        const { name, value } = e.target;
        const updatedSubcontent = [...subjectInput.subcontent];
        updatedSubcontent[index][name] = value;
        setSubjectInput({
            ...subjectInput,
            subcontent: updatedSubcontent,
        });
    };

    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (files) {
            const fileArray = Array.from(files);
            setImageFiles([...imageFiles, ...fileArray]);

            const previewURLs = fileArray.map((file) => URL.createObjectURL(file));
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

    const addQuestion = () => {
        setQuestionInput([
            ...questionInput,
            {
                question: { content: "", type: "" },
                answers: [],
            },
        ]);
    };

    const deleteQuestion = (questionIndex) => {
        const updatedQuestions = [...questionInput];
        updatedQuestions.splice(questionIndex, 1);
        setQuestionInput(updatedQuestions);
    };

    const addAnswer = (questionIndex) => {
        const updatedQuestions = [...questionInput];
        updatedQuestions[questionIndex].answers.push({ content: "", type: "" });
        setQuestionInput(updatedQuestions);
    };

    const deleteAnswer = (questionIndex, answerIndex) => {
        const updatedQuestions = [...questionInput];
        updatedQuestions[questionIndex].answers.splice(answerIndex, 1);
        setQuestionInput(updatedQuestions);
    };

    const handleQuestionChange = (questionIndex, field, value, isAnswer = false, answerIndex = null) => {
        const updatedQuestions = [...questionInput];

        if (isAnswer) {
        updatedQuestions[questionIndex].answers[answerIndex][field] = value;
        } else {
        updatedQuestions[questionIndex].question[field] = value;
        }

        setQuestionInput(updatedQuestions);
    };

    const saveSubjectData = async () => {
        const formData = new FormData();

        const { name, content, subcontent, summary } = subjectInput;
        const jsonData = { content, subcontent, summary };

        if (!name) {
            alert("Subject name is required");
            return;
        }
        if (!content.title) {
            alert("Content title is required");
            return;
        }
        if (!content.description) {
            alert("Content description is required");
            return;
        }
        if (subcontent.length > 0) {
            for (let i = 0; i < subcontent.length; i++) {
                if (!subcontent[i].title) {
                alert(`Subcontent ${i + 1} title is required`);
                return;
                }
                if (!subcontent[i].description) {
                alert(`Subcontent ${i + 1} description is required`);
                return;
                }
            }
        }
        if (!summary) {
            alert("Summary is required");
            return;
        }

        formData.append("name", name);
        formData.append("data", JSON.stringify(jsonData));

        imageFiles.forEach((file) => {
        formData.append("images", file);
        });

        try {
        const response = await backend.post(`/teacher/saveSubject/${courseId}`,
            formData,{ headers: {"Content-Type": "multipart/form-data"}}
        );

        if (response.status === 200) {
            alert(response.data.message);
            setTimeout(() => navigate(`/edit-course/${courseId}`), 2000);
        }
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
              type="text"
              placeholder="Subject Name"
              required
              value={subjectInput.name}
              onChange={(e) =>
                setSubjectInput({ ...subjectInput, name: e.target.value })
              }
            />
          </div>

          <div className={style["input-images"]}>
            <h3>Upload Images</h3>
            <input type="file" multiple onChange={handleImageUpload} />
            <div className={style["image-preview"]}>
              {previewImages.map((preview, index) => (
                <div key={index} className={style["image-item"]}>
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className={style["preview-image"]}
                  />
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
                  type="text"
                  placeholder="Title"
                  required
                  value={subjectInput.content.title}
                  onChange={(e) =>
                    setSubjectInput({
                      ...subjectInput,
                      content: {
                        ...subjectInput.content,
                        title: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div>
                <label>Description</label>
                <textarea
                  rows="4"
                  cols="50"
                  placeholder="Description"
                  required
                  value={subjectInput.content.description}
                  onChange={(e) =>
                    setSubjectInput({
                      ...subjectInput,
                      content: {
                        ...subjectInput.content,
                        description: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <h3>Subcontent</h3>
            {subjectInput.subcontent.map((sub, index) => (
              <div className={style["sub-content"]} key={index}>
                <div>
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Title"
                    required
                    value={sub.title}
                    onChange={(e) => handleSubcontentChange(e, index)}
                    name="title"
                  />
                </div>

                <div>
                  <label>Description</label>
                  <textarea
                    rows="4"
                    cols="50"
                    placeholder="Description"
                    required
                    value={sub.description}
                    onChange={(e) => handleSubcontentChange(e, index)}
                    name="description"
                  />
                </div>
              </div>
            ))}

            <button
              className={style["add-subcontent-button"]}
              onClick={addSubcontent}
            >
              Add Subcontent
            </button>

            <div className={style["summary-container"]}>
              <h3>Summary</h3>
              <div>
                <textarea
                  rows="4"
                  cols="50"
                  placeholder="Summary"
                  required
                  value={subjectInput.summary}
                  onChange={(e) =>
                    setSubjectInput({
                      ...subjectInput,
                      summary: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className={style["input-questions-container"]}>
            <h2>Questions</h2>
            {questionInput.map((item, questionIndex) => (
                <div key={questionIndex} className={style["question-item"]}>

                    <div className={style["question-header"]}>
                        <div className={style["question-input-group"]}>
                            <input
                                type="text"
                                placeholder="Enter question"
                                value={item.question.content}
                                onChange={(e) =>
                                    handleQuestionChange(questionIndex, "content", e.target.value)
                                }
                            />
                            <select
                                value={item.question.type}
                                onChange={(e) =>
                                    handleQuestionChange(questionIndex, "type", e.target.value)
                                }
                            >
                                <option value="">Select Question Type</option>
                                {questionType.map((type, i) => (
                                    <option key={i} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {item.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className={style["answer-item"]}>
                            <div className={style["answer-input-group"]}>
                                <input
                                    type="text"
                                    placeholder="Enter answer"
                                    value={answer.content}
                                    onChange={(e) =>
                                        handleQuestionChange(
                                            questionIndex,
                                            "content",
                                            e.target.value,
                                            true,
                                            answerIndex
                                        )
                                    }
                                />
                                <select
                                    value={answer.type}
                                    onChange={(e) =>
                                        handleQuestionChange(
                                            questionIndex,
                                            "type",
                                            e.target.value,
                                            true,
                                            answerIndex
                                        )
                                    }
                                >
                                    <option value="">Select Answer Type</option>
                                    {answerType.map((type, i) => (
                                        <option key={i} value={type}>
                                            {type === 1 ? "Answer" : "Choice"}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    className={style["delete-answer-button"]}
                                    onClick={() => deleteAnswer(questionIndex, answerIndex)}
                                >
                                    <img
                                        alt="Delete answer input"
                                        src="/Navbar_Assets/Close_round_light.svg"
                                    />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className={style["question-footer"]}>
                        <button
                            className={style["add-answer-button"]}
                            onClick={() => addAnswer(questionIndex)}
                        >
                            Add Answer
                        </button>
                        <button
                            className={style["delete-question-button"]}
                            onClick={() => deleteQuestion(questionIndex)}
                        >
                            Delete Question
                        </button>
                    </div>
                </div>
            ))}
            <button
                className={style["add-question-button"]}
                onClick={addQuestion}
            >
                Add Question
            </button>
        </div>

        <div className={style["button-container"]}>
          <button onClick={saveSubjectData}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddSubject;
