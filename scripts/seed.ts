// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const database = new PrismaClient();
const fs = require("fs");

async function main() {
  await initProvince();
  await initDistrict();
  await initWard();
  await initUserAdmin();
  await initCategory();
  await initTemplate();
}

async function initWard() {
  try {
    const { data } = await axios.get(`${process.env.URL_LOCATION}/w`);
    const datas = data.map((ward) => ({
      id: ward.code.toString(),
      name: ward.name,
      groupId: ward.district_code.toString(),
    }));

    await database.ward.createMany({
      data: datas,
    });
    console.log("Khởi tạo thông tin Phường/Xã thành công");
  } catch (error) {
    console.log("Lỗi khi khởi tạo thông tin Phường/Xã", error);
  } finally {
    await database.$disconnect();
  }
}

async function initDistrict() {
  try {
    const { data } = await axios.get(`${process.env.URL_LOCATION}/d`);
    const datas = data.map((district) => ({
      id: district.code.toString(),
      name: district.name,
      groupId: district.province_code.toString(),
    }));

    await database.district.createMany({
      data: datas,
    });
    console.log("Khởi tạo thông tin Quận/Huyện thành công");
  } catch (error) {
    console.log("Lỗi khi khởi tạo thông tin Quận/Huyện", error);
  } finally {
    await database.$disconnect();
  }
}

async function initProvince() {
  try {
    const { data } = await axios.get(`${process.env.URL_LOCATION}/p`);
    const datas = data.map((province) => ({
      id: province.code.toString(),
      name: province.name,
      groupId: "",
    }));

    await database.province.createMany({
      data: datas,
    });
    console.log("Khởi tạo thông tin Tỉnh/Thành phố thành công");
  } catch (error) {
    console.log("Lỗi khi khởi tạo thông tin Tỉnh/Thành phố", error);
  } finally {
    await database.$disconnect();
  }
}

async function initUserAdmin() {
  try {
    await database.user.create({
      data: {
        email: "admin@gmail.com",
        passwordHash:
          "$2a$05$9OWH4DaRbu8J1xvQg1K.T.EGYrsPk.eXAuBrkCzN1XTIrFG7Mu2ze",
        username: "admin",
        phone: "0123456789",
        role: "ADMIN",
      },
    });
    console.log("Khởi tạo tài khoản admin thành công");
  } catch (error) {
    console.log("Lỗi khi khởi tạo thông tin Administrator", error);
  } finally {
    await database.$disconnect();
  }
}

async function initTemplate() {
  try {
    const categorySystem = await database.category.findUnique({
      where: {
        code: "System",
      },
    });

    const admin = await database.user.findFirst({
      where: {
        username: "admin",
        role: "ADMIN",
      },
    });

    const mailTemplate = fs
      .readFileSync(
        `${__dirname}/../templates/mail-confirm/mail-confirm.html`,
        "utf-8"
      )
      .toString();

    await database.template.createMany({
      data: [
        {
          name: "Mẫu mail xác thực",
          categoryId: categorySystem?.id,
          content: mailTemplate,
          userId: admin?.id,
          code: "MailConfirmUser",
        },
      ],
    });
    console.log("Khởi tạo template hệ thống thành công");
  } catch (error) {
    console.log("Lỗi khi tạo dữ liệu Template", error);
  } finally {
    await database.$disconnect();
  }
}

async function initCategory() {
  try {
    await database.category.createMany({
      data: [
        { name: "Hệ thống", code: "System" },
        { name: "Mẫu mail", code: "Mail" },
        { name: "Frontend Developer", code: "FE", group: "Menu" },
        { name: "ReactJS", code: "ReactJS", group: "FE" },
        { name: "Angular", code: "Angular", group: "FE" },
        { name: "VueJS", code: "VueJS", group: "FE" },
        { name: "Backend Developer", code: "BE", group: "Menu" },
        { name: ".NET", code: "DotNet", group: "BE" },
        { name: "Java", code: "Java", group: "BE" },
        { name: "NodeJS", code: "NodeJS", group: "BE" },
      ],
    });
    console.log("Khởi tạo category thành công");
  } catch (error) {
    console.log("Lỗi khi tạo dữ liệu Category", error);
  } finally {
    await database.$disconnect();
  }
}

main();
