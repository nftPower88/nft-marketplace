import DiscordIcon from '../svgs/discord';
import TwitterIcon from '../svgs/twitter';
import InstagramIcon from '../svgs/instagram';
import RedditIcon from '../svgs/reddit';
import YoutubeIcon from '../svgs/youtube';
import { Row, Col } from 'antd';

export const SocialIcon = () => {
  return (
    <Row justify="space-between" style={{ width: '200px' }}>
      <Col>
        <a href="https://twitter.com/Queendomverse">
          <TwitterIcon />
        </a>
      </Col>
      <Col>
        <a href="https://instagram.com">
          <InstagramIcon />
        </a>
      </Col>
      <Col>
        <a href="https://discord.gg/vYBcfGSdYr">
          <DiscordIcon />
        </a>
      </Col>
      <Col>
        <a href="https://www.reddit.com/r/queendomverse">
          <RedditIcon />
        </a>
      </Col>
      <Col>
        <a href="https://www.youtube.com">
          <YoutubeIcon />
        </a>
      </Col>
    </Row>
  );
};
