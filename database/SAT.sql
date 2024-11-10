-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Nov 10, 2024 at 03:56 PM
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
(64, '123456', 'a', 16),
(66, '951357', 'a', 18);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `CourseID` int NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `Detail` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin,
  `Icon_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`CourseID`, `Name`, `Detail`, `Icon_id`) VALUES
(3, 'Social Engineering', 'Welcome to Social Engineering Course.', 'Icon');

-- --------------------------------------------------------

--
-- Table structure for table `history`
--

CREATE TABLE `history` (
  `HistoryID` int NOT NULL,
  `User-Email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Subject-ID` int NOT NULL,
  `Score` int NOT NULL,
  `Status` varchar(255) COLLATE utf8mb3_bin NOT NULL DEFAULT 'Doing',
  `Type` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `history`
--

INSERT INTO `history` (`HistoryID`, `User-Email`, `Subject-ID`, `Score`, `Status`, `Type`) VALUES
(36, 'AAA', 6, 8, 'Success', 'Pre'),
(37, 'AAA', 7, 8, 'Success', 'Pre');

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
(16, 'จงหารหัสที่ส่งมาจาก Email ที่ไม่ใช่ Phishing จากจดหมายที่ส่งมาทั้งหมด', 'lab', 6),
(18, 'จงหารหัสที่ส่งมาจาก Email ที่ไม่ใช่ SPAM จากจดหมายที่ส่งมาทั้งหมด', 'lab', 7);

-- --------------------------------------------------------

--
-- Table structure for table `subject`
--

CREATE TABLE `subject` (
  `SubjectID` int NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `Content` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_bin,
  `Image_id` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `Course-ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `subject`
--

INSERT INTO `subject` (`SubjectID`, `Name`, `Content`, `Image_id`, `Course-ID`) VALUES
(6, 'Phishing', '     เป็นหนึ่งในเทคนิคที่ใช้ใน Social Engineering ที่ผู้ไม่หวังดีจะพยายามหลอกลวงเหยื่อให้เปิดเผยข้อมูลสำคัญ เช่น รหัสผ่าน ข้อมูลบัตรเครดิต หรือข้อมูลส่วนตัวอื่นๆ ผ่านการแอบอ้างเป็นบุคคลหรือองค์กรที่เชื่อถือได้\r\n\r\nข้อมูลสำคัญเกี่ยวกับ Phishing ใน Social Engineering\r\n1.ลักษณะของ Phishing\r\n\r\n-การแอบอ้างเป็นแหล่งที่เชื่อถือได้: Phishing มักมีการปลอมตัวเป็นหน่วยงานที่น่าเชื่อถือ เช่น ธนาคาร สถาบันการเงิน เว็บไซต์สื่อสังคมออนไลน์ หรือแม้แต่หน่วยงานของรัฐ\r\n-การกระตุ้นให้เหยื่อทำตามคำแนะนำ: มักใช้ข้อความที่สร้างความตื่นตระหนกหรือเร่งด่วน เช่น \"บัญชีของคุณถูกล็อค\" หรือ \"ตรวจพบกิจกรรมที่น่าสงสัย\" เพื่อให้เหยื่อคลิกที่ลิงก์หรือดาวน์โหลดไฟล์แนบ\r\n-วิธีการโจมตีหลายช่องทาง: Phishing อาจมาในรูปแบบอีเมล, SMS, โซเชียลมีเดีย, หรือโทรศัพท์ โดยช่องทางที่พบบ่อยที่สุดคืออีเมล\r\n\r\n2.ประเภทของ Phishing\r\n\r\n-Spear Phishing: การโจมตีที่มุ่งเน้นไปยังเป้าหมายเฉพาะ โดยจะปรับเนื้อหาของข้อความให้ตรงกับเหยื่อโดยเฉพาะ เพื่อเพิ่มความน่าเชื่อถือ เช่น ใช้ชื่อ ตำแหน่งงาน หรือข้อมูลส่วนตัวอื่นๆ\r\n-Whaling: เป็นการ Phishing ที่มุ่งเน้นโจมตีบุคคลระดับสูงในองค์กร เช่น ผู้บริหาร โดยเนื้อหาจะมีความเฉพาะเจาะจงและซับซ้อนกว่าปกติ\r\n-Clone Phishing: ใช้อีเมลที่เคยส่งจริงแล้วนำมาแก้ไขลิงก์หรือไฟล์แนบให้เป็นอันตราย และส่งใหม่ให้เหยื่อ ทำให้เหยื่อรู้สึกว่าอีเมลเป็นของจริง\r\n-Vishing และ Smishing: Vishing คือการหลอกลวงทางโทรศัพท์ โดยแอบอ้างเป็นตัวแทนจากหน่วยงานต่างๆ เพื่อขอข้อมูลสำคัญ ส่วน Smishing คือการ Phishing ผ่านข้อความ SMS ที่มีลิงก์ให้คลิก\r\n\r\n3.วิธีการโจมตี Phishing\r\n\r\n-การสร้างเว็บไซต์ปลอม: ผู้โจมตีจะสร้างเว็บไซต์ที่เลียนแบบเว็บไซต์จริง เช่น หน้าล็อกอินของธนาคาร หรือบริการอีเมล ซึ่งทำให้เหยื่อใส่ข้อมูลเข้าสู่เว็บไซต์ปลอมโดยคิดว่าเป็นของจริง\r\n-การส่งลิงก์หรือไฟล์แนบอันตราย: ลิงก์ในอีเมลหรือข้อความ Phishing มักจะนำไปสู่เว็บไซต์ปลอม หรือไฟล์แนบที่ติดมัลแวร์ ทำให้ข้อมูลส่วนตัวของเหยื่อถูกขโมยได้\r\n\r\n4.ตัวอย่างสถานการณ์ Phishing\r\n\r\n-อีเมลจากธนาคารปลอม: ข้อความอ้างว่ามาจากธนาคาร แจ้งว่าบัญชีของคุณถูกระงับและขอให้คุณคลิกลิงก์เพื่อเข้าสู่ระบบและยืนยันข้อมูล\r\n-ข้อความแจ้งเตือนจากบริการออนไลน์: เช่น Netflix หรือ PayPal ที่แจ้งว่าไม่สามารถชำระค่าบริการได้ และต้องการให้คุณเข้าสู่ระบบผ่านลิงก์ในอีเมล\r\n-อีเมลจากแผนกไอทีในบริษัท: แจ้งว่าระบบของบริษัทมีปัญหา และต้องการให้คุณอัปเดตรหัสผ่านผ่านลิงก์ที่ให้มา\r\n\r\n5.วิธีป้องกันตัวจาก Phishing\r\n\r\n-ตรวจสอบ URL ก่อนคลิก: URL ของเว็บไซต์ปลอมมักจะแตกต่างเล็กน้อยจากของจริง เช่น มีตัวอักษรเพิ่มหรือเปลี่ยนโดเมน ตรวจสอบให้แน่ใจก่อนคลิกลิงก์ใดๆ\r\n-ไม่เปิดไฟล์แนบจากแหล่งที่ไม่น่าเชื่อถือ: หากได้รับอีเมลหรือข้อความที่มีไฟล์แนบหรือขอให้ดาวน์โหลดโปรแกรม ควรหลีกเลี่ยงการเปิดโดยเฉพาะหากไม่น่าเชื่อถือ\r\n-เปิดใช้การยืนยันตัวตนสองขั้นตอน (2FA): 2FA สามารถช่วยป้องกันไม่ให้ผู้โจมตีเข้าถึงบัญชีได้ แม้จะมีรหัสผ่านของคุณ\r\n-ใช้โปรแกรมกรอง Phishing: อีเมลโปรแกรมและเบราว์เซอร์บางตัวมีการกรองและแจ้งเตือน Phishing ที่สามารถช่วยลดความเสี่ยงได้', 'Icon', 3),
(7, 'SPAM', 'เป็นหนึ่งในวิธีการที่ผู้ไม่หวังดีใช้เพื่อหลอกลวงและเข้าถึงข้อมูลส่วนบุคคลหรือทรัพยากรของเหยื่อ โดยการส่งข้อมูลจำนวนมากผ่านช่องทางต่างๆ เช่น อีเมล ข้อความโซเชียลมีเดีย หรือข้อความ SMS เพื่อดึงดูดให้เหยื่อตอบกลับหรือคลิกที่ลิงก์ที่แนบมาด้วย\r\n\r\nข้อมูลสำคัญเกี่ยวกับ Spam ใน Social Engineering\r\n\r\n1.ลักษณะของ Spam\r\n\r\n-ปริมาณการส่ง: ส่งข้อความจำนวนมากให้กับผู้ใช้ในเวลาเดียวกัน โดยไม่เจาะจงผู้รับ\r\n-เนื้อหาที่น่าสงสัย: มักประกอบด้วยข้อความที่กระตุ้นความสนใจหรือความเร่งด่วน เช่น \"คุณได้รับรางวัล!\" หรือ \"รีบคลิกก่อนหมดเวลา\"\r\n-แหล่งที่มาที่ไม่ชัดเจน: มาจากแหล่งที่ไม่น่าเชื่อถือ หรือบางครั้งอาจดูเหมือนมาจากหน่วยงานที่น่าเชื่อถือ แต่จริงๆ แล้วถูกปลอมแปลงขึ้นมา\r\n\r\n2.วิธีการใช้งาน Spam ใน Social Engineering\r\n\r\n-Phishing (ฟิชชิ่ง): ใช้เพื่อขโมยข้อมูลส่วนตัว เช่น รหัสผ่านหรือข้อมูลบัตรเครดิต โดยหลอกให้เหยื่อคลิกที่ลิงก์ที่นำไปสู่เว็บไซต์ปลอม\r\n-Malware Delivery: แนบไฟล์ที่มีมัลแวร์ในอีเมลหรือข้อความเพื่อให้เหยื่อดาวน์โหลดและติดตั้งโปรแกรมที่เป็นอันตรายโดยไม่รู้ตัว\r\n-Scams (การหลอกลวง): ส่งข้อความที่มีเนื้อหาหลอกลวง เช่น การลงทุนปลอม หรือข้อเสนอที่ดูน่าสนใจเกินจริง เพื่อให้เหยื่อโอนเงินหรือให้ข้อมูลส่วนตัว\r\n\r\n3.วิธีการป้องกันตัวจาก Spam\r\n\r\n-ระวังอีเมลและข้อความจากแหล่งที่ไม่น่าเชื่อถือ: หลีกเลี่ยงการคลิกที่ลิงก์หรือดาวน์โหลดไฟล์จากอีเมลหรือข้อความที่มาจากผู้ส่งที่ไม่รู้จัก\r\n-ใช้โปรแกรมกรอง Spam: ใช้โปรแกรมอีเมลที่มีระบบกรอง Spam หรือมีการตั้งค่าการรักษาความปลอดภัยเพื่อกรองเนื้อหาที่อาจเป็นอันตราย\r\n-ฝึกการรับรู้ถึง Spam: สังเกตลักษณะของข้อความที่อาจเป็น Spam เช่น ข้อความที่ใช้คำเร่งด่วน หรือขอให้ให้ข้อมูลสำคัญอย่างเร่งรีบ\r\n\r\n', 'icon', 3);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `Email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Name` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Role` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT 'User',
  `OTP` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL,
  `OTP_EXP` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`Email`, `Password`, `Name`, `Role`, `OTP`, `OTP_EXP`) VALUES
('AAA', '$2b$10$rvhN7NsLbTUWbQJTM7kSpOyqlb2MQRA7HzlmJVu3ng6kO8Ho8KWN6', 'a', 'Student', '-', NULL),
('ABC', '$2b$10$HIwLXl6PTS7A0qspbP8agOsSMCI5fpi67RLHz0.IWArmSuHOWHeoe', 'akakak', 'Student', '-', NULL),
('Test', '$2b$10$zq.K1KnpA4ugzBMufliFyu/soLUEKgtGv.RLP2Idq7EAVGtEhh5ly', 'asdv', 'Student', '-', NULL),
('admin', '$2b$10$4//6S5EIBVirOXvGeS/qHuGnE6jGt6kFZK3tT97vDCeRu44jv0y.a', 'Admin Inwza', 'Admin', '-', NULL),
('arcarnupab@gmail.com', '$2b$10$2k5dhsEK8ZVeTXl4sz6kZeeTmFjO3F7dWC3Cj.IYWKppwlWWh0MmG', 'Arc', 'Student', '759528', '2024-09-29 18:23:05');

-- --------------------------------------------------------

--
-- Table structure for table `virtual matchine`
--

CREATE TABLE `virtual matchine` (
  `VirtualMatchineID` int NOT NULL,
  `Subject-ID` int NOT NULL,
  `IP-Address` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

--
-- Dumping data for table `virtual matchine`
--

INSERT INTO `virtual matchine` (`VirtualMatchineID`, `Subject-ID`, `IP-Address`) VALUES
(33, 6, '172.17.0.2:32769');

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
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`CourseID`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`HistoryID`),
  ADD KEY `User-Email` (`User-Email`),
  ADD KEY `Subject-ID_idx` (`Subject-ID`);

--
-- Indexes for table `question`
--
ALTER TABLE `question`
  ADD PRIMARY KEY (`QuestionID`),
  ADD KEY `Subject-ID_idx` (`Subject-ID`);

--
-- Indexes for table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`SubjectID`),
  ADD KEY `Couese-ID_idx` (`Course-ID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`Email`);

--
-- Indexes for table `virtual matchine`
--
ALTER TABLE `virtual matchine`
  ADD PRIMARY KEY (`VirtualMatchineID`),
  ADD KEY `VM_Subject-ID_idx` (`Subject-ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answer`
--
ALTER TABLE `answer`
  MODIFY `AnswerID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `CourseID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `HistoryID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `question`
--
ALTER TABLE `question`
  MODIFY `QuestionID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `subject`
--
ALTER TABLE `subject`
  MODIFY `SubjectID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `virtual matchine`
--
ALTER TABLE `virtual matchine`
  MODIFY `VirtualMatchineID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answer`
--
ALTER TABLE `answer`
  ADD CONSTRAINT `AnswerOfQuestion` FOREIGN KEY (`QuestionID`) REFERENCES `question` (`QuestionID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `history`
--
ALTER TABLE `history`
  ADD CONSTRAINT `Subject-ID` FOREIGN KEY (`Subject-ID`) REFERENCES `subject` (`SubjectID`),
  ADD CONSTRAINT `User-Email` FOREIGN KEY (`User-Email`) REFERENCES `user` (`Email`);

--
-- Constraints for table `question`
--
ALTER TABLE `question`
  ADD CONSTRAINT `Ques_Subject-ID` FOREIGN KEY (`Subject-ID`) REFERENCES `subject` (`SubjectID`);

--
-- Constraints for table `subject`
--
ALTER TABLE `subject`
  ADD CONSTRAINT `Couese-ID` FOREIGN KEY (`Course-ID`) REFERENCES `courses` (`CourseID`);

--
-- Constraints for table `virtual matchine`
--
ALTER TABLE `virtual matchine`
  ADD CONSTRAINT `VM_Subject-ID` FOREIGN KEY (`Subject-ID`) REFERENCES `subject` (`SubjectID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
