package de.vc.recorder.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.vc.recorder.IntegrationTest;
import de.vc.recorder.domain.Channel;
import de.vc.recorder.domain.enumeration.MediaType;
import de.vc.recorder.repository.ChannelRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ChannelResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ChannelResourceIT {

    private static final MediaType DEFAULT_MEDIA_TYPE = MediaType.AUDIO;
    private static final MediaType UPDATED_MEDIA_TYPE = MediaType.VIDEO;

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final Boolean DEFAULT_THROW_AWAY_ALLOWED = false;
    private static final Boolean UPDATED_THROW_AWAY_ALLOWED = true;

    private static final Boolean DEFAULT_THREAT_ALLOWED = false;
    private static final Boolean UPDATED_THREAT_ALLOWED = true;

    private static final String ENTITY_API_URL = "/api/channels";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ChannelRepository channelRepository;

    @Mock
    private ChannelRepository channelRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restChannelMockMvc;

    private Channel channel;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Channel createEntity(EntityManager em) {
        Channel channel = new Channel()
            .mediaType(DEFAULT_MEDIA_TYPE)
            .name(DEFAULT_NAME)
            .throwAwayAllowed(DEFAULT_THROW_AWAY_ALLOWED)
            .threatAllowed(DEFAULT_THREAT_ALLOWED);
        return channel;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Channel createUpdatedEntity(EntityManager em) {
        Channel channel = new Channel()
            .mediaType(UPDATED_MEDIA_TYPE)
            .name(UPDATED_NAME)
            .throwAwayAllowed(UPDATED_THROW_AWAY_ALLOWED)
            .threatAllowed(UPDATED_THREAT_ALLOWED);
        return channel;
    }

    @BeforeEach
    public void initTest() {
        channel = createEntity(em);
    }

    @Test
    @Transactional
    void createChannel() throws Exception {
        int databaseSizeBeforeCreate = channelRepository.findAll().size();
        // Create the Channel
        restChannelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(channel)))
            .andExpect(status().isCreated());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeCreate + 1);
        Channel testChannel = channelList.get(channelList.size() - 1);
        assertThat(testChannel.getMediaType()).isEqualTo(DEFAULT_MEDIA_TYPE);
        assertThat(testChannel.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testChannel.getThrowAwayAllowed()).isEqualTo(DEFAULT_THROW_AWAY_ALLOWED);
        assertThat(testChannel.getThreatAllowed()).isEqualTo(DEFAULT_THREAT_ALLOWED);
    }

    @Test
    @Transactional
    void createChannelWithExistingId() throws Exception {
        // Create the Channel with an existing ID
        channel.setId(1L);

        int databaseSizeBeforeCreate = channelRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restChannelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(channel)))
            .andExpect(status().isBadRequest());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkMediaTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = channelRepository.findAll().size();
        // set the field null
        channel.setMediaType(null);

        // Create the Channel, which fails.

        restChannelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(channel)))
            .andExpect(status().isBadRequest());

        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = channelRepository.findAll().size();
        // set the field null
        channel.setName(null);

        // Create the Channel, which fails.

        restChannelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(channel)))
            .andExpect(status().isBadRequest());

        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllChannels() throws Exception {
        // Initialize the database
        channelRepository.saveAndFlush(channel);

        // Get all the channelList
        restChannelMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(channel.getId().intValue())))
            .andExpect(jsonPath("$.[*].mediaType").value(hasItem(DEFAULT_MEDIA_TYPE.toString())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].throwAwayAllowed").value(hasItem(DEFAULT_THROW_AWAY_ALLOWED.booleanValue())))
            .andExpect(jsonPath("$.[*].threatAllowed").value(hasItem(DEFAULT_THREAT_ALLOWED.booleanValue())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChannelsWithEagerRelationshipsIsEnabled() throws Exception {
        when(channelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChannelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(channelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChannelsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(channelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChannelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(channelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getChannel() throws Exception {
        // Initialize the database
        channelRepository.saveAndFlush(channel);

        // Get the channel
        restChannelMockMvc
            .perform(get(ENTITY_API_URL_ID, channel.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(channel.getId().intValue()))
            .andExpect(jsonPath("$.mediaType").value(DEFAULT_MEDIA_TYPE.toString()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.throwAwayAllowed").value(DEFAULT_THROW_AWAY_ALLOWED.booleanValue()))
            .andExpect(jsonPath("$.threatAllowed").value(DEFAULT_THREAT_ALLOWED.booleanValue()));
    }

    @Test
    @Transactional
    void getNonExistingChannel() throws Exception {
        // Get the channel
        restChannelMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewChannel() throws Exception {
        // Initialize the database
        channelRepository.saveAndFlush(channel);

        int databaseSizeBeforeUpdate = channelRepository.findAll().size();

        // Update the channel
        Channel updatedChannel = channelRepository.findById(channel.getId()).get();
        // Disconnect from session so that the updates on updatedChannel are not directly saved in db
        em.detach(updatedChannel);
        updatedChannel
            .mediaType(UPDATED_MEDIA_TYPE)
            .name(UPDATED_NAME)
            .throwAwayAllowed(UPDATED_THROW_AWAY_ALLOWED)
            .threatAllowed(UPDATED_THREAT_ALLOWED);

        restChannelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedChannel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedChannel))
            )
            .andExpect(status().isOk());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
        Channel testChannel = channelList.get(channelList.size() - 1);
        assertThat(testChannel.getMediaType()).isEqualTo(UPDATED_MEDIA_TYPE);
        assertThat(testChannel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testChannel.getThrowAwayAllowed()).isEqualTo(UPDATED_THROW_AWAY_ALLOWED);
        assertThat(testChannel.getThreatAllowed()).isEqualTo(UPDATED_THREAT_ALLOWED);
    }

    @Test
    @Transactional
    void putNonExistingChannel() throws Exception {
        int databaseSizeBeforeUpdate = channelRepository.findAll().size();
        channel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChannelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, channel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(channel))
            )
            .andExpect(status().isBadRequest());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchChannel() throws Exception {
        int databaseSizeBeforeUpdate = channelRepository.findAll().size();
        channel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChannelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(channel))
            )
            .andExpect(status().isBadRequest());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamChannel() throws Exception {
        int databaseSizeBeforeUpdate = channelRepository.findAll().size();
        channel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChannelMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(channel)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateChannelWithPatch() throws Exception {
        // Initialize the database
        channelRepository.saveAndFlush(channel);

        int databaseSizeBeforeUpdate = channelRepository.findAll().size();

        // Update the channel using partial update
        Channel partialUpdatedChannel = new Channel();
        partialUpdatedChannel.setId(channel.getId());

        partialUpdatedChannel.mediaType(UPDATED_MEDIA_TYPE).name(UPDATED_NAME).threatAllowed(UPDATED_THREAT_ALLOWED);

        restChannelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChannel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedChannel))
            )
            .andExpect(status().isOk());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
        Channel testChannel = channelList.get(channelList.size() - 1);
        assertThat(testChannel.getMediaType()).isEqualTo(UPDATED_MEDIA_TYPE);
        assertThat(testChannel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testChannel.getThrowAwayAllowed()).isEqualTo(DEFAULT_THROW_AWAY_ALLOWED);
        assertThat(testChannel.getThreatAllowed()).isEqualTo(UPDATED_THREAT_ALLOWED);
    }

    @Test
    @Transactional
    void fullUpdateChannelWithPatch() throws Exception {
        // Initialize the database
        channelRepository.saveAndFlush(channel);

        int databaseSizeBeforeUpdate = channelRepository.findAll().size();

        // Update the channel using partial update
        Channel partialUpdatedChannel = new Channel();
        partialUpdatedChannel.setId(channel.getId());

        partialUpdatedChannel
            .mediaType(UPDATED_MEDIA_TYPE)
            .name(UPDATED_NAME)
            .throwAwayAllowed(UPDATED_THROW_AWAY_ALLOWED)
            .threatAllowed(UPDATED_THREAT_ALLOWED);

        restChannelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChannel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedChannel))
            )
            .andExpect(status().isOk());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
        Channel testChannel = channelList.get(channelList.size() - 1);
        assertThat(testChannel.getMediaType()).isEqualTo(UPDATED_MEDIA_TYPE);
        assertThat(testChannel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testChannel.getThrowAwayAllowed()).isEqualTo(UPDATED_THROW_AWAY_ALLOWED);
        assertThat(testChannel.getThreatAllowed()).isEqualTo(UPDATED_THREAT_ALLOWED);
    }

    @Test
    @Transactional
    void patchNonExistingChannel() throws Exception {
        int databaseSizeBeforeUpdate = channelRepository.findAll().size();
        channel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChannelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, channel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(channel))
            )
            .andExpect(status().isBadRequest());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchChannel() throws Exception {
        int databaseSizeBeforeUpdate = channelRepository.findAll().size();
        channel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChannelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(channel))
            )
            .andExpect(status().isBadRequest());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamChannel() throws Exception {
        int databaseSizeBeforeUpdate = channelRepository.findAll().size();
        channel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChannelMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(channel)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Channel in the database
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteChannel() throws Exception {
        // Initialize the database
        channelRepository.saveAndFlush(channel);

        int databaseSizeBeforeDelete = channelRepository.findAll().size();

        // Delete the channel
        restChannelMockMvc
            .perform(delete(ENTITY_API_URL_ID, channel.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Channel> channelList = channelRepository.findAll();
        assertThat(channelList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
