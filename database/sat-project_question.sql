-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Nov 08, 2024 at 03:54 PM
-- Server version: 9.1.0
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `SAT`
--

-- --------------------------------------------------------

--
-- Table structure for table `question`
--

CREATE TABLE `question` (
  `QuestionID` int NOT NULL,
  `Question` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Subject-ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `question`
--

INSERT INTO `question` (`QuestionID`, `Question`, `Type`, `Subject-ID`) VALUES
(1, 'การโจมตีแบบฟิชชิ่งคืออะไร?', 'pretest', 6),
(2, 'ฟิชชิ่งคืออะไร?', 'pretest', 6),
(3, 'สัญญาณที่บ่งบอกว่าอีเมลเป็นฟิชชิ่งคืออะไร?', 'pretest', 6),
(4, 'ควรทำอย่างไรหากได้รับอีเมลฟิชชิ่ง?', 'pretest', 6),
(5, 'ฟิชชิ่งสามารถเกิดขึ้นได้ผ่านช่องทางใดบ้าง?', 'pretest', 6),
(6, 'ทำไมฟิชชิ่งถึงเป็นอันตราย?', 'pretest', 6),
(7, 'ควรทำอย่างไรหากไม่แน่ใจว่าอีเมลเป็นฟิชชิ่งหรือไม่?', 'pretest', 6),
(8, 'ฟิชชิ่งมักจะใช้วิธีใดในการหลอกลวงผู้ใช้?', 'pretest', 6),
(9, 'ควรทำอย่างไรหากคลิกลิงก์ในอีเมลฟิชชิ่งโดยไม่ตั้งใจ?', 'pretest', 6),
(10, 'ฟิชชิ่งสามารถทำให้เกิดความเสียหายอะไรได้บ้าง?', 'pretest', 6),
(11, 'ควรทำอย่างไรหากได้รับอีเมลที่ขอข้อมูลส่วนตัว?', 'pretest', 6),
(12, 'ฟิชชิ่งสามารถเกิดขึ้นได้ในรูปแบบใดบ้าง?', 'pretest', 6),
(13, 'ควรทำอย่างไรหากได้รับอีเมลที่ดูเหมือนจะมาจากธนาคารแต่ไม่แน่ใจ?', 'pretest', 6),
(14, 'ฟิชชิ่งมักจะใช้วิธีใดในการหลอกลวงผู้ใช้?', 'pretest', 6),
(15, 'ควรทำอย่างไรหากคลิกลิงก์ในอีเมลฟิชชิ่งโดยไม่ตั้งใจ?', 'pretest', 6),
(16, 'สมมุติเหตุการณ์ที่มีอีเมลแจ้งเตือนความปลอดภัยถูกส่งมาภายในอีเมลของคุณ โดยมีทั้งจากระบบและจากผู้ไม่หวังดี  จงนำรหัสที่ถูกต้องจากอีเมลที่ไม่ใช่เมล phising มาป้อนลงช่องคำตอบ', 'lab', 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`QuestionID`),
  ADD KEY `Subject-ID_idx` (`Subject-ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `QuestionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `Ques_Subject-ID` FOREIGN KEY (`Subject-ID`) REFERENCES `subject` (`SubjectID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
