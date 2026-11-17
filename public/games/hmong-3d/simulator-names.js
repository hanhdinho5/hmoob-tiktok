const NAMES={
 male:['Tuấn','Hạnh','Cậu Giang','Minh','A Páo','Hoàng Nam','Đức Anh','Vàng A Sính','Hải Đăng','Mạnh Hùng','A Lử','Quang Huy','Thanh Sơn','Cậu Phong','Văn Lâm','A Dũng','Trọng Nghĩa','Xuân Trường','Cậu Bình','Đình Khang'],
 female:['My','Linh Diệu','Dua Xanh','Mai Anh','Mây Trắng','Ngọc Hân','Chị Súa','Thu Hà','Pàng Xinh','Hồng Nhung','Bé Dâu','Diệu Linh','Hoa Núi','Thảo Nhi','Yến Nhi','Thanh Trúc','Mùa Thị Dợ','Bảo Ngọc','Nắng Mai','Chị Dung'],
};
export function simulatedName(serial,characterId,used=new Set()){
 const gender=characterId?.startsWith('female-')?'female':characterId?.startsWith('male-')?'male':serial%2?'male':'female';
 const pool=NAMES[gender],start=Math.floor((serial-1)/2)%pool.length;
 for(const family of ['', 'Nguyễn ', 'Vàng ', 'Mùa ', 'Lý ', 'Trần '])for(let i=0;i<pool.length;i++){const name=family+pool[(start+i)%pool.length];if(!used.has(name))return name;}
 return pool[start];
}
