import STR_ApplicationPage from '../structures/STR_ApplicationPage';
import COM_FormEditProfile from '../components/COM_FormEditProfile';

function PAG_EditProfile() {
  return (
    <STR_ApplicationPage prTitle="Edit Profile">
      <COM_FormEditProfile />
    </STR_ApplicationPage>
  );
}

export default PAG_EditProfile;
