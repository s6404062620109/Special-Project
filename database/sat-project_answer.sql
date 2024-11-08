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
-- Table structure for table `answer`
--

CREATE TABLE `answer` (
  `AnswerID` int NOT NULL,
  `result` longtext NOT NULL,
  `Type` char(1) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `QuestionID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `answer`
--

INSERT INTO `answer` (`AnswerID`, `result`, `Type`, `QuestionID`) VALUES
(4, 'ความพยายามที่จะขโมยข้อมูลที่ละเอียดอ่อนเพื่อใช้หรือขายข้อมูลที่ถูกขโมย ด้วยการปลอมตัวเป็นแหล่งที่เชื่อถือได้พร้อมกับคำขอที่ล่อลวง', 'a', 1),
(5, 'ไม่รู้\r\n', 'c', 1),
(6, 'การแฮ็คเพื่อทำให้ระบบล้ม', 'c', 1),
(7, 'การกู้คืนข้อมูลจากระบบที่ล้ม', 'c', 1),
(8, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อขโมยข้อมูลส่วนตัว', 'a', 2),
(9, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อทำลายระบบคอมพิวเตอร์', 'c', 2),
(10, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อขโมยเงิน', 'c', 2),
(11, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อขโมยข้อมูลการเข้าสู่ระบบ', 'c', 2),
(12, 'อีเมลมาจากที่อยู่ที่ไม่คุ้นเคย', 'c', 3),
(13, 'อีเมลมีข้อผิดพลาดทางไวยากรณ์', 'c', 3),
(14, 'อีเมลขอข้อมูลส่วนตัว', 'c', 3),
(15, 'ทั้งหมดข้างต้น', 'a', 3),
(16, 'ตอบกลับอีเมลเพื่อยืนยันความถูกต้อง', 'c', 4),
(17, 'ลบอีเมลทันที', 'c', 4),
(18, 'ส่งต่ออีเมลไปยังเพื่อน', 'c', 4),
(19, 'รายงานอีเมลไปยังฝ่าย IT', 'a', 4),
(20, 'อีเมล', 'c', 5),
(21, 'ข้อความ SMS', 'c', 5),
(22, 'โทรศัพท์', 'c', 5),
(23, 'ทั้งหมดข้างต้น', 'a', 5),
(24, 'สามารถขโมยข้อมูลส่วนตัว', 'c', 6),
(25, 'สามารถติดตั้งมัลแวร์ในคอมพิวเตอร์', 'c', 6),
(26, 'สามารถขโมยเงิน', 'c', 6),
(27, 'ทั้งหมดข้างต้น', 'a', 6),
(28, 'คลิกลิงก์ในอีเมลเพื่อดูว่าเกิดอะไรขึ้น', 'c', 7),
(29, 'ติดต่อผู้ส่งเพื่อยืนยันความถูกต้อง', 'a', 7),
(30, 'ลบอีเมลทันที', 'c', 7),
(31, 'ส่งต่ออีเมลไปยังเพื่อน', 'c', 7),
(32, 'การเสนอข้อเสนอที่น่าสนใจ', 'c', 8),
(33, 'การข่มขู่ให้ผู้ใช้ตอบกลับ', 'c', 8),
(34, 'การปลอมแปลงเป็นองค์กรที่น่าเชื่อถือ', 'c', 8),
(35, 'ทั้งหมดข้างต้น', 'a', 8),
(36, 'ลบอีเมลทันที', 'c', 9),
(37, 'เปลี่ยนรหัสผ่านที่เกี่ยวข้อง', 'c', 9),
(38, 'ติดต่อฝ่าย IT', 'c', 9),
(39, 'ทั้ง B และ C', 'a', 9),
(40, 'ขโมยข้อมูลส่วนตัว', 'c', 10),
(41, 'ขโมยเงิน', 'c', 10),
(42, 'ติดตั้งมัลแวร์ในคอมพิวเตอร์', 'c', 10),
(43, 'ทั้งหมดข้างต้น', 'a', 10),
(44, 'ตอบกลับอีเมลทันที', 'c', 11),
(45, 'ลบอีเมลทันที', 'c', 11),
(46, 'รายงานอีเมลไปยังฝ่าย IT', 'c', 11),
(47, 'ทั้ง B และ C', 'a', 11),
(48, 'อีเมล', 'c', 12),
(49, 'ข้อความ SMS', 'c', 12),
(50, 'โทรศัพท์', 'c', 12),
(51, 'ทั้งหมดข้างต้น', 'a', 12),
(52, 'คลิกลิงก์ในอีเมลเพื่อยืนยัน', 'c', 13),
(53, 'ติดต่อธนาคารโดยตรง', 'a', 13),
(54, 'ลบอีเมลทันที', 'c', 13),
(55, 'ส่งต่ออีเมลไปยังเพื่อน', 'c', 13),
(56, 'การเสนอข้อเสนอที่น่าสนใจ', 'c', 14),
(57, 'การข่มขู่ให้ผู้ใช้ตอบกลับ', 'c', 14),
(58, 'การปลอมแปลงเป็นองค์กรที่น่าเชื่อถือ', 'c', 14),
(59, 'ทั้งหมดข้างต้น', 'a', 14),
(60, 'ลบอีเมลทันที', 'c', 15),
(61, 'เปลี่ยนรหัสผ่านที่เกี่ยวข้อง', 'c', 15),
(62, 'ทั้ง B และ D', 'a', 15),
(63, 'ติดต่อฝ่าย IT', 'c', 15),
(64, 'AaaBbbCcc_123456', 'a', 16);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `answer`
--
ALTER TABLE `answer`
  ADD PRIMARY KEY (`AnswerID`),
  ADD KEY `AnswerOfQuestion` (`QuestionID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answer`
--
ALTER TABLE `answer`
  MODIFY `AnswerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answer`
--
ALTER TABLE `answer`
  ADD CONSTRAINT `AnswerOfQuestion` FOREIGN KEY (`QuestionID`) REFERENCES `question` (`QuestionID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
