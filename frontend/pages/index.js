
import HomeComponent from "../components/home"
import axios from "axios"

const Home = ({ collections }) => {
  return (
    <div>
      <HomeComponent
        collections={collections}
      />
    </div>
  )
}

const list = async () => {
  const res = await axios.get(`https://api.tamagonft.xyz/v1/dashboard`);
  const { collections } = res.data;
  return collections
}

export async function getStaticProps(ctx) {

  try {
    return { props: { collections: await list() }, revalidate: 3600 };
  } catch (error) {
    return { props: { error: error.message } };
  }

};

export default Home
