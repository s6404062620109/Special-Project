-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Sep 30, 2024 at 04:13 PM
-- Server version: 9.0.1
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
  `Type` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `QuestionID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `answer`
--

INSERT INTO `answer` (`AnswerID`, `result`, `Type`, `QuestionID`) VALUES
(4, 'ความพยายามที่จะขโมยข้อมูลที่ละเอียดอ่อนเพื่อใช้หรือขายข้อมูลที่ถูกขโมย ด้วยการปลอมตัวเป็นแหล่งที่เชื่อถือได้พร้อมกับคำขอที่ล่อลวง', 'ans', 1),
(5, 'ไม่รู้\r\n', 'ch', 1),
(6, 'การแฮ็คเพื่อทำให้ระบบล้ม', 'ch', 1),
(7, 'การกู้คืนข้อมูลจากระบบที่ล้ม', 'ch', 1),
(8, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อขโมยข้อมูลส่วนตัว', 'ans', 2),
(9, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อทำลายระบบคอมพิวเตอร์', 'ch', 2),
(10, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อขโมยเงิน', 'ch', 2),
(11, 'การโจมตีทางไซเบอร์ที่ใช้เพื่อขโมยข้อมูลการเข้าสู่ระบบ', 'ch', 2),
(12, 'อีเมลมาจากที่อยู่ที่ไม่คุ้นเคย', 'ch', 3),
(13, 'อีเมลมีข้อผิดพลาดทางไวยากรณ์', 'ch', 3),
(14, 'อีเมลขอข้อมูลส่วนตัว', 'ch', 3),
(15, 'ทั้งหมดข้างต้น', 'ans', 3),
(16, 'ตอบกลับอีเมลเพื่อยืนยันความถูกต้อง', 'ch', 4),
(17, 'ลบอีเมลทันที', 'ch', 4),
(18, 'ส่งต่ออีเมลไปยังเพื่อน', 'ch', 4),
(19, 'รายงานอีเมลไปยังฝ่าย IT', 'ans', 4),
(20, 'อีเมล', 'ch', 5),
(21, 'ข้อความ SMS', 'ch', 5),
(22, 'โทรศัพท์', 'ch', 5),
(23, 'ทั้งหมดข้างต้น', 'ans', 5),
(24, 'สามารถขโมยข้อมูลส่วนตัว', 'ch', 6),
(25, 'สามารถติดตั้งมัลแวร์ในคอมพิวเตอร์', 'ch', 6),
(26, 'สามารถขโมยเงิน', 'ch', 6),
(27, 'ทั้งหมดข้างต้น', 'ans', 6),
(28, 'คลิกลิงก์ในอีเมลเพื่อดูว่าเกิดอะไรขึ้น', 'ch', 7),
(29, 'ติดต่อผู้ส่งเพื่อยืนยันความถูกต้อง', 'ans', 7),
(30, 'ลบอีเมลทันที', 'ch', 7),
(31, 'ส่งต่ออีเมลไปยังเพื่อน', 'ch', 7),
(32, 'การเสนอข้อเสนอที่น่าสนใจ', 'ch', 8),
(33, 'การข่มขู่ให้ผู้ใช้ตอบกลับ', 'ch', 8),
(34, 'การปลอมแปลงเป็นองค์กรที่น่าเชื่อถือ', 'ch', 8),
(35, 'ทั้งหมดข้างต้น', 'ans', 8),
(36, 'ลบอีเมลทันที', 'ch', 9),
(37, 'เปลี่ยนรหัสผ่านที่เกี่ยวข้อง', 'ch', 9),
(38, 'ติดต่อฝ่าย IT', 'ch', 9),
(39, 'ทั้ง B และ C', 'ans', 9),
(40, 'ขโมยข้อมูลส่วนตัว', 'ch', 10),
(41, 'ขโมยเงิน', 'ch', 10),
(42, 'ติดตั้งมัลแวร์ในคอมพิวเตอร์', 'ch', 10),
(43, 'ทั้งหมดข้างต้น', 'ans', 10),
(44, 'ตอบกลับอีเมลทันที', 'ch', 11),
(45, 'ลบอีเมลทันที', 'ch', 11),
(46, 'รายงานอีเมลไปยังฝ่าย IT', 'ch', 11),
(47, 'ทั้ง B และ C', 'ans', 11),
(48, 'อีเมล', 'ch', 12),
(49, 'ข้อความ SMS', 'ch', 12),
(50, 'โทรศัพท์', 'ch', 12),
(51, 'ทั้งหมดข้างต้น', 'ans', 12),
(52, 'คลิกลิงก์ในอีเมลเพื่อยืนยัน', 'ch', 13),
(53, 'ติดต่อธนาคารโดยตรง', 'ans', 13),
(54, 'ลบอีเมลทันที', 'ch', 13),
(55, 'ส่งต่ออีเมลไปยังเพื่อน', 'ch', 13),
(56, 'การเสนอข้อเสนอที่น่าสนใจ', 'ch', 14),
(57, 'การข่มขู่ให้ผู้ใช้ตอบกลับ', 'ch', 14),
(58, 'การปลอมแปลงเป็นองค์กรที่น่าเชื่อถือ', 'ch', 14),
(59, 'ทั้งหมดข้างต้น', 'ans', 14),
(60, 'ลบอีเมลทันที', 'ch', 15),
(61, 'เปลี่ยนรหัสผ่านที่เกี่ยวข้อง', 'ch', 15),
(62, 'ทั้ง B และ D', 'ans', 15),
(63, 'ติดต่อฝ่าย IT', 'ch', 15);

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
  MODIFY `AnswerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

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
