import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import backend from "../../../api/backend";

import style from "./css/addsubject.module.css";
import PdfPreview from "./PdfPreview";

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
  const [showPreview, setShowPreview] = useState(false);
  const [mode, setMode] = useState("manual");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState("");
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

  useEffect(() => {
    return () => {
      if (pdfPreview) {
        URL.revokeObjectURL(pdfPreview);
        console.log("Revoked old URL:", pdfPreview);
      }
    };
  }, [pdfPreview]);

  const formatContent = (content) => {
    if (!content) return null;
  
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([\w\-]{11})/gi;
    const imageMarkdownRegex = /!\[(.*?)\]\((.*?)\)/g;
  
    return content.split("\n").map((line, index) => {
      const trimmedLine = line.trim();
  
      if (!trimmedLine) {
        return <br key={index} />;
      }
  
      // Check for YouTube links
      const youtubeMatch = trimmedLine.match(youtubeRegex);
      if (youtubeMatch) {
        const videoId = youtubeMatch[0].includes("youtu.be")
          ? youtubeMatch[0].split("/")[3]
          : youtubeMatch[0].split("v=")[1].split("&")[0];
  
        return (
          <React.Fragment key={index}>
            <div className={style["video-wrapper"]}>
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </React.Fragment>
        );
      }
  
      // Check for image markdown
      const imageMatch = imageFiles.find((img) => trimmedLine.includes(img.name));
      if (imageMatch) {
        const imageIndex = imageFiles.indexOf(imageMatch);
        return (
          <React.Fragment key={index}>
            <img
              src={previewImages[imageIndex]}
              alt={imageMatch.name}
              className={style.Picture}
            />
            <br />
          </React.Fragment>
        );
      }
  
      // Render plain text
      return (
        <React.Fragment key={index}>
          {trimmedLine.split(" ").map((word, wordIndex) => (
            <span key={wordIndex}>
              {word}{" "}
            </span>
          ))}
          <br />
        </React.Fragment>
      );
    });
  };

  const validateSubjectInput = () => {
    const { name, content, subcontent, summary } = subjectInput;

    if (!name || name.trim() === "") {
      alert("Subject name is required");
      return false;
    }

    if (!content.title || content.title.trim() === "") {
      alert("Content title is required");
      return false;
    }

    if (!content.description || content.description.trim() === "") {
      alert("Content description is required");
      return false;
    }

    if (subcontent.length > 0) {
      for (let i = 0; i < subcontent.length; i++) {
        if (!subcontent[i].title || subcontent[i].title.trim() === "") {
          alert(`Subcontent ${i + 1} title is required`);
          return false;
        }
        if (!subcontent[i].description || subcontent[i].description.trim() === "") {
          alert(`Subcontent ${i + 1} description is required`);
          return false;
        }
      }
    }

    return true;
  };

  const togglePreview = () => {
    if (!validateSubjectInput()) {
      return;
    }
    setShowPreview(!showPreview);
  };

  const deleteSubcontent = (index) => {
    const updatedSubcontent = subjectInput.subcontent.filter((_, i) => i !== index);
    setSubjectInput({
      ...subjectInput,
      subcontent: updatedSubcontent,
    });
  };

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
    const files = Array.from(e.target.files);
  
    setImageFiles([
      ...imageFiles,
      ...files.map((file) => ({ file, name: file.name })),
    ]);
  
    const previewURLs = files.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...previewURLs]);
  };

  const handleImageInsert = (e, index = null) => {
    const selectedImage = e.target.value;
    if (!selectedImage) return;
  
    const imageMarkdown = `\n${selectedImage}`;
  
    if (index === null) {
      setSubjectInput({
        ...subjectInput,
        content: {
          ...subjectInput.content,
          description: subjectInput.content.description + imageMarkdown,
        },
      });
    } else {
      const updatedSubcontent = [...subjectInput.subcontent];
      updatedSubcontent[index].description += imageMarkdown;
      setSubjectInput({
        ...subjectInput,
        subcontent: updatedSubcontent,
      });
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

  const handleQuestionChange = (
    questionIndex,
    field,
    value,
    isAnswer = false,
    answerIndex = null
  ) => {
    const updatedQuestions = [...questionInput];

    if (isAnswer) {
      updatedQuestions[questionIndex].answers[answerIndex][field] = value;
    } else {
      updatedQuestions[questionIndex].question[field] = value;
    }

    setQuestionInput(updatedQuestions);
  };

  const handleFileUpload = (e, questionIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const isValid = content.includes("<!-- INSERT ANSWER HERE -->");

      const updatedQuestions = [...questionInput];
      updatedQuestions[questionIndex].labFile = file;
      updatedQuestions[questionIndex].isValidFile = isValid;
      setQuestionInput(updatedQuestions);
    };
    reader.readAsText(file);
  };

  const saveSubjectData = async () => {
    const formData = new FormData();
  
    const { name, content, subcontent, summary } = subjectInput;
    const jsonData = { content, subcontent, summary };
  
    if (!name) {
      alert("Subject name is required");
      return;
    }
  
    if (mode === "manual") {
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
    }
  
    const hasPreTest = questionInput.some((q) => q.question.type === "pre");
    const hasPostTest = questionInput.some((q) => q.question.type === "post");
  
    if (!hasPreTest) {
      alert("ต้องมีคำถามประเภท 'แบบทดสอบก่อนเรียน' อย่างน้อย 1 ข้อ");
      return;
    }
    if (!hasPostTest) {
      alert("ต้องมีคำถามประเภท 'แบบทดสอบหลังเรียน' อย่างน้อย 1 ข้อ");
      return;
    }
    for (let i = 0; i < questionInput.length; i++) {
      const hasAnswer = questionInput[i].answers.some((ans) => ans.type === "1");
      if (!hasAnswer) {
        alert(`คำถามที่ ${i + 1} ต้องมีคำตอบประเภท "คำตอบ" อย่างน้อย 1 คำตอบ`);
        return;
      }
    }
  
    formData.append("name", name);
    formData.append("mode", mode);
  
    if (mode === "manual") {
      formData.append("data", JSON.stringify(jsonData));
      formData.append("questions", JSON.stringify(questionInput));
  
      imageFiles.forEach((file) => {
        formData.append("images", file.file);
      });
  
      questionInput.forEach((question, index) => {
        if (question.question.type === "lab-w" && question.labFile) {
          if (question.labFile instanceof File) {
            formData.append(`labFile-${index}`, question.labFile);
          } else {
            console.error("Invalid lab file:", question.labFile);
            alert(`Invalid lab file for question ${index + 1}`);
            return;
          }
        }
      });
    } else if (mode === "pdf") {
      if (!pdfFile || !(pdfFile instanceof File)) {
        alert("PDF file is required for PDF mode");
        return;
      }
      formData.append("pdfFile", pdfFile);
      formData.append("questions", JSON.stringify(questionInput));

      questionInput.forEach((question, index) => {
        if (question.question.type === "lab-w" && question.labFile) {
          if (question.labFile instanceof File) {
            formData.append(`labFile-${index}`, question.labFile);
          } else {
            console.error("Invalid lab file:", question.labFile);
            alert(`Invalid lab file for question ${index + 1}`);
            return;
          }
        }
      });
    }
  
    try {
      const response = await backend.post(`/teacher/saveSubject/${courseId}`,
        formData, { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      if (response.status === 200) {
        alert(response.data.message);
        setTimeout(() => navigate(`/edit-course/${courseId}`), 2000);
      }
    } catch (error) {
      console.error("Error saving subject data:", error);
      alert("An error occurred while saving the subject. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfPreview(URL.createObjectURL(file));
    } else {
      alert("กรุณาอัปโหลดไฟล์ PDF เท่านั้น");
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

          <div className={style["mode-selector"]}>
            <label> 
              <input
                type="radio"
                value="manual"
                checked={mode === "manual"}
                onChange={() => setMode("manual")}
              />
              เพิ่มเนื้อหาด้วยตนเอง
            </label>
            <label>
              <input
                type="radio"
                value="pdf"
                checked={mode === "pdf"}
                onChange={() => setMode("pdf")}
              />
              อัปโหลดไฟล์ PDF
            </label>
          </div>

          {mode === "manual" && (
            <div className={style.body}>
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
                    rows="10"
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

                <div className={style["image-selector"]}>
                  <h3>Select Image to Insert</h3>
                  <select onChange={(e) => handleImageInsert(e)}>
                    <option value="">Select an image</option>
                    {imageFiles.map((file, index) => (
                      <option key={index} value={file.name}>
                        {file.name}
                      </option>
                    ))}
                  </select>
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
                      rows="10"
                      cols="50"
                      placeholder="Description"
                      required
                      value={sub.description}
                      onChange={(e) => handleSubcontentChange(e, index)}
                      name="description"
                    />
                  </div>

                  <button
                    className={style["delete-subcontent-button"]}
                    onClick={() => deleteSubcontent(index)}
                  >
                    <img
                      alt="Delete subcontent input"
                      src="/My_Coursesp/Bin.svg"
                    />
                  </button>

                  <div className={style["image-selector"]}>
                    <h3>Select Image to Insert</h3>
                    <select onChange={(e) => handleImageInsert(e, index)}>
                      <option value="">Select an image</option>
                      {imageFiles.map((file, index) => (
                        <option key={index} value={file.name}>
                          {file.name}
                        </option>
                      ))}
                    </select>
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

              <button onClick={togglePreview} className={style["preview-button"]}>
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>

              {showPreview && (
                <div className={style["preview-overlay"]}>
                  <div className={style["preview-container"]}>
                    <button className={style["close-btn"]} onClick={() => setShowPreview(false)}>✖</button>
                    <div className={style["preview-content"]}>
                      <h1>{subjectInput.name}</h1>
                      <h2>{subjectInput.content.title}</h2>
                      <p>{formatContent(subjectInput.content.description)}</p>

                      {subjectInput.subcontent.map((sub, index) => (
                        <div key={index} className={style["preview-subcontent"]}>
                          <h3>{sub.title}</h3>
                          <p>{formatContent(sub.description)}</p>
                        </div>
                      ))}

                      {subjectInput.summary && (
                        <div className={style["preview-summary"]}>
                          <h3>สรุป</h3>
                          <p>{formatContent(subjectInput.summary)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {mode === "pdf" && (
            <div className={style["pdf-upload-section"]}>
              <h3>อัปโหลดไฟล์ PDF</h3>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
              />

              {pdfPreview && (
                <div className={style["pdf-preview-section"]}>
                  <h3>PDF Preview</h3>
                  <PdfPreview fileUrl={pdfPreview} />
                </div>
              )}
            </div>
          )}
          
        </div>

        <div className={style["input-questions-container"]}>
          <h2>Questions</h2>
          {questionInput.map((item, questionIndex) => (
            <div key={questionIndex} className={style["question-item"]}>
              <div className={style["question-header"]}>
                <div className={style["question-input-group"]}>
                  <p>{questionIndex + 1}.</p>

                  <div className={style["input-wrapper"]}>
                    <input
                      type="text"
                      placeholder="Please enter question here."
                      value={item.question.content}
                      onChange={(e) =>
                        handleQuestionChange(
                          questionIndex,
                          "content",
                          e.target.value
                        )
                      }
                    />
                    <select
                      value={item.question.type}
                      onChange={(e) =>
                        handleQuestionChange(
                          questionIndex,
                          "type",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Question Type</option>
                      {questionType.map((type, i) => (
                        <option key={i} value={type}>
                          {type === "lab" && "แลปคำถาม"}
                          {type === "lab-w" && "แลปจำลองสถานการณ์"}
                          {type === "pre" && "แบบทดสอบก่อนเรียน"}
                          {type === "post" && "แบบทดสอบหลังเรียน"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {item.question.type === "lab-w" && (
                    <div className={style["lab-upload-section"]}>
                      <p>
                        <a href="/example.html" download>
                          Download Sample Lab File
                        </a>
                      </p>
                      <input
                        type="file"
                        accept=".html"
                        onChange={(e) => handleFileUpload(e, questionIndex)}
                      />
                      {item.isValidFile === false && (
                        <p style={{ color: "red" }}>
                          File does not contain "&lt;!-- INSERT ANSWER HERE
                          --&gt;"
                        </p>
                      )}
                      {item.isValidFile === true && (
                        <p style={{ color: "green" }}>File is valid</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {item.answers.map((answer, answerIndex) => (
                <div key={answerIndex} className={style["answer-item"]}>
                  <div className={style["answer-input-group"]}>
                    <div className={style["answer-input"]}>
                      <input
                        type="text"
                        placeholder="Please enter answer here."
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
                            {type === 1 ? "คำตอบ" : "ตัวเลือก"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className={style["delete-answer-button"]}
                      onClick={() => deleteAnswer(questionIndex, answerIndex)}
                    >
                      <img
                        alt="Delete answer input"
                        src="/My_Coursesp/Bin.svg"
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
                  <img alt="Add answer input" src="/My_Coursesp/Add.svg" />
                  Add Answer
                </button>

                <button
                  className={style["delete-question-button"]}
                  onClick={() => deleteQuestion(questionIndex)}
                >
                  <img alt="Delete question input" src="/My_Coursesp/Bin.svg" />
                  Delete Question
                </button>
              </div>
            </div>
          ))}

          <div className={style["button-wrapper"]}>
            <button
              className={style["add-question-button"]}
              onClick={addQuestion}
            >
              Add Question
            </button>
          </div>
        </div>

        <div className={style["button-container"]}>
          <button onClick={() => navigate(`/edit-course/${courseId}`)}>
            Back
          </button>
          <button onClick={saveSubjectData}>Save</button>
        </div>
      </div>
    </div>
  );
}

export default AddSubject;
